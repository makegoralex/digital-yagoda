import { Schema, model } from 'mongoose';

export interface CompanyDocument {
  _id: Schema.Types.ObjectId;
  name: string;
  slug: string;
  brand: {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  features: Record<string, boolean>;
  ownerId: Schema.Types.ObjectId;
  timezone: string;
  locale: 'ru' | 'en';
  billing?: {
    vatNumber?: string;
    address?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<CompanyDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    brand: {
      logoUrl: String,
      primaryColor: String,
      secondaryColor: String
    },
    plan: {
      type: String,
      enum: ['FREE', 'PRO', 'ENTERPRISE'],
      default: 'FREE',
      index: true
    },
    features: { type: Map, of: Boolean, default: {} },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    timezone: { type: String, default: 'Europe/Moscow' },
    locale: { type: String, enum: ['ru', 'en'], default: 'ru' },
    billing: {
      vatNumber: String,
      address: String
    }
  },
  { timestamps: true }
);

export const CompanyModel = model<CompanyDocument>('Company', companySchema);
