import { Router } from 'express';
import { z } from 'zod';

import { CompanyModel } from '../models/company.model';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/require-role';
import { mapToObject } from '../utils/normalize';

export const companyRouter = Router();

companyRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const company = await CompanyModel.findById(req.user!.companyId);
  if (!company) {
    return res.status(404).json({ message: 'Company not found' });
  }
  res.json({
    id: company._id.toString(),
    name: company.name,
    slug: company.slug,
    plan: company.plan,
    timezone: company.timezone,
    locale: company.locale,
    brand: company.brand,
    features: mapToObject<boolean>(company.features) ?? {}
  });
});

const updateCompanySchema = z.object({
  name: z.string().min(2).optional(),
  timezone: z.string().optional(),
  locale: z.enum(['ru', 'en']).optional(),
  brand: z
    .object({
      logoUrl: z.string().url().optional(),
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional()
    })
    .partial()
    .optional(),
  features: z.record(z.boolean()).optional()
});

companyRouter.patch(
  '/',
  requireAuth,
  requireRole(['OWNER', 'MANAGER']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = updateCompanySchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: 'Validation error', errors: parsed.error.flatten() });
    }

    const company = await CompanyModel.findOneAndUpdate(
      { _id: req.user!.companyId },
      { $set: parsed.data },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({
      id: company._id.toString(),
      name: company.name,
      slug: company.slug,
      plan: company.plan,
      timezone: company.timezone,
      locale: company.locale,
      brand: company.brand,
      features: mapToObject<boolean>(company.features) ?? {}
    });
  }
);
