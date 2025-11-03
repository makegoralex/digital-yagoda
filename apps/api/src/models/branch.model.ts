import { Schema, model } from 'mongoose';

export interface BranchDocument {
  _id: Schema.Types.ObjectId;
  companyId: Schema.Types.ObjectId;
  name: string;
  code?: string;
  address?: string;
  timezone?: string;
  workHours?: Record<string, { open: string; close: string; closed?: boolean }>;
  kdsLines?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const branchSchema = new Schema<BranchDocument>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    name: { type: String, required: true, index: true },
    code: { type: String },
    address: { type: String },
    timezone: { type: String },
    workHours: { type: Map, of: new Schema({ open: String, close: String, closed: Boolean }) },
    kdsLines: { type: [String], default: [] }
  },
  { timestamps: true }
);

branchSchema.index({ companyId: 1, name: 1 });

export const BranchModel = model<BranchDocument>('Branch', branchSchema);
