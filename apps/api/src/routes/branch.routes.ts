import { Router } from 'express';
import { z } from 'zod';

import { AuthenticatedRequest, requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/require-role';
import { BranchModel } from '../models/branch.model';
import { mapToObject } from '../utils/normalize';

export const branchRouter = Router();

branchRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const branches = await BranchModel.find({ companyId: req.user!.companyId })
    .sort({ createdAt: -1 })
    .lean();
  res.json(
    branches.map((branch) => ({
      id: branch._id.toString(),
      name: branch.name,
      code: branch.code,
      address: branch.address,
      timezone: branch.timezone,
      kdsLines: branch.kdsLines,
      workHours: mapToObject<{ open: string; close: string; closed?: boolean }>(branch.workHours)
    }))
  );
});

const createBranchSchema = z.object({
  name: z.string().min(1),
  code: z.string().optional(),
  address: z.string().optional(),
  timezone: z.string().optional(),
  workHours: z
    .record(z.object({ open: z.string(), close: z.string(), closed: z.boolean().optional() }))
    .optional(),
  kdsLines: z.array(z.string()).optional()
});

branchRouter.post(
  '/',
  requireAuth,
  requireRole(['OWNER', 'MANAGER']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = createBranchSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: 'Validation error', errors: parsed.error.flatten() });
    }

    const branch = await BranchModel.create({
      ...parsed.data,
      companyId: req.user!.companyId
    });

    res.status(201).json({
      id: branch._id.toString(),
      name: branch.name,
      code: branch.code,
      address: branch.address,
      timezone: branch.timezone,
      kdsLines: branch.kdsLines,
      workHours: mapToObject<{ open: string; close: string; closed?: boolean }>(branch.workHours)
    });
  }
);

const updateBranchSchema = createBranchSchema.partial();

branchRouter.patch(
  '/:id',
  requireAuth,
  requireRole(['OWNER', 'MANAGER']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = updateBranchSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: 'Validation error', errors: parsed.error.flatten() });
    }

    const branch = await BranchModel.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user!.companyId },
      { $set: parsed.data },
      { new: true }
    );

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    res.json({
      id: branch._id.toString(),
      name: branch.name,
      code: branch.code,
      address: branch.address,
      timezone: branch.timezone,
      kdsLines: branch.kdsLines,
      workHours: mapToObject<{ open: string; close: string; closed?: boolean }>(branch.workHours)
    });
  }
);
