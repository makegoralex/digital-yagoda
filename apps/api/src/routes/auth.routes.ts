import { Router } from 'express';
import { startSession } from 'mongoose';
import argon2 from 'argon2';
import { z } from 'zod';

import { CompanyModel } from '../models/company.model';
import { BranchModel } from '../models/branch.model';
import { UserModel } from '../models/user.model';
import { createTokens } from '../services/token.service';
import { verifyToken } from '../utils/jwt';
import { slugify } from '../utils/slug';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  companyName: z.string().min(2),
  slug: z.string().optional(),
  owner: z
    .object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      phone: z.string().optional()
    })
    .default({}),
  timezone: z.string().default('Europe/Moscow'),
  locale: z.enum(['ru', 'en']).default('ru'),
  firstBranch: z
    .object({
      name: z.string().min(1),
      code: z.string().optional()
    })
    .optional()
});

authRouter.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() });
  }

  const { email, password, companyName, slug, owner, timezone, locale, firstBranch } = parsed.data;

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const session = await startSession();
  try {
    const baseSlugCandidate = slug ? slugify(slug) : slugify(companyName);
    const baseSlug = baseSlugCandidate.length > 0 ? baseSlugCandidate : `company-${Date.now()}`;
    let companySlug = baseSlug;
    let suffix = 1;
    while (await CompanyModel.exists({ slug: companySlug }).session(session)) {
      companySlug = `${baseSlug}-${suffix++}`;
    }

    let payloadToSend:
      | {
          user: {
            id: string;
            email: string;
            role: string;
            companyId: string;
            firstName?: string;
            lastName?: string;
          };
          company: { id: string; name: string; slug: string };
          accessToken: string;
          refreshToken: string;
        }
      | null = null;

    await session.withTransaction(async () => {
      const passwordHash = await argon2.hash(password);
      const user = await UserModel.create(
        [
          {
            email,
            passwordHash,
            role: 'OWNER',
            companyId: null,
            firstName: owner.firstName,
            lastName: owner.lastName,
            phone: owner.phone,
            locale,
            isActive: true
          }
        ],
        { session }
      );

      const company = await CompanyModel.create(
        [
          {
            name: companyName,
            slug: companySlug,
            ownerId: user[0]._id,
            plan: 'FREE',
            features: {},
            timezone,
            locale
          }
        ],
        { session }
      );

      await UserModel.updateOne({ _id: user[0]._id }, { companyId: company[0]._id }, { session });

      if (firstBranch) {
        await BranchModel.create(
          [
            {
              companyId: company[0]._id,
              name: firstBranch.name,
              code: firstBranch.code,
              timezone
            }
          ],
          { session }
        );
      }

      const refreshedUser = await UserModel.findById(user[0]._id).session(session);
      if (!refreshedUser || !refreshedUser.companyId) {
        throw new Error('Failed to bind company to user');
      }

      const hydratedUser = refreshedUser as typeof refreshedUser & {
        companyId: NonNullable<typeof refreshedUser.companyId>;
      };
      const tokens = createTokens(hydratedUser);
      payloadToSend = {
        user: {
          id: refreshedUser._id.toString(),
          email: refreshedUser.email,
          role: refreshedUser.role,
          companyId: refreshedUser.companyId.toString(),
          firstName: refreshedUser.firstName ?? undefined,
          lastName: refreshedUser.lastName ?? undefined
        },
        company: {
          id: company[0]._id.toString(),
          name: company[0].name,
          slug: company[0].slug
        },
        ...tokens
      };
    });

    if (payloadToSend) {
      return res.status(201).json(payloadToSend);
    }
    throw new Error('Registration failed');
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    res.status(500).json({ message: 'Failed to register', error: (error as Error).message });
  } finally {
    session.endSession();
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() });
  }

  const { email, password } = parsed.data;
  const user = await UserModel.findOne({ email });
  if (!user || !user.companyId) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  if (!user.isActive) {
    return res.status(403).json({ message: 'User is inactive' });
  }

  const isValid = await argon2.verify(user.passwordHash, password);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  user.lastLoginAt = new Date();
  await user.save();

  const tokens = createTokens(user as typeof user & { companyId: NonNullable<typeof user.companyId> });
  res.json({
    user: {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      companyId: user.companyId.toString()
    },
    ...tokens
  });
});

const refreshSchema = z.object({
  refreshToken: z.string()
});

authRouter.post('/refresh', async (req, res) => {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() });
  }

  const { refreshToken } = parsed.data;
  try {
    const payload = verifyToken<{
      sub: string;
      companyId: string;
      role: string;
      tokenVersion: number;
      exp: number;
      iat: number;
    }>(refreshToken);

    const user = await UserModel.findById(payload.sub);
    if (!user || !user.companyId || user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const tokens = createTokens(user as typeof user & {
      companyId: NonNullable<typeof user.companyId>;
    });
    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        companyId: user.companyId.toString()
      },
      ...tokens
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

authRouter.post('/logout', async (req, res) => {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() });
  }
  const { refreshToken } = parsed.data;
  try {
    const payload = verifyToken<{ sub: string }>(refreshToken);
    await UserModel.updateOne({ _id: payload.sub }, { $inc: { tokenVersion: 1 } });
  } catch (error) {
    // ignore invalid token on logout
  }
  res.status(204).send();
});
