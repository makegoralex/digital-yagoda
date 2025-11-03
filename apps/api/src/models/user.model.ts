import { Schema, model } from 'mongoose';

export interface UserDocument {
  _id: Schema.Types.ObjectId;
  companyId: Schema.Types.ObjectId | null;
  email: string;
  phone?: string;
  passwordHash: string;
  role: 'OWNER' | 'MANAGER' | 'CASHIER' | 'KITCHEN' | 'TRAINER' | 'ACCOUNTANT' | 'SUPPORT';
  firstName?: string;
  lastName?: string;
  locale?: 'ru' | 'en';
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  tokenVersion: number;
}

const userSchema = new Schema<UserDocument>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', default: null, index: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['OWNER', 'MANAGER', 'CASHIER', 'KITCHEN', 'TRAINER', 'ACCOUNTANT', 'SUPPORT'],
      default: 'OWNER',
      index: true
    },
    firstName: { type: String },
    lastName: { type: String },
    locale: { type: String, enum: ['ru', 'en'], default: 'ru' },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    tokenVersion: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const UserModel = model<UserDocument>('User', userSchema);
