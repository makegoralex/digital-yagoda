export type ObjectId = string;

export type UserRole =
  | 'OWNER'
  | 'MANAGER'
  | 'CASHIER'
  | 'KITCHEN'
  | 'TRAINER'
  | 'ACCOUNTANT'
  | 'SUPPORT';

export interface User {
  _id: ObjectId;
  companyId: ObjectId | null;
  email: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  locale?: 'ru' | 'en';
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyBranding {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export type CompanyPlan = 'FREE' | 'PRO' | 'ENTERPRISE';

export interface Company {
  _id: ObjectId;
  name: string;
  slug: string;
  brand: CompanyBranding;
  plan: CompanyPlan;
  features: Record<string, boolean>;
  ownerId: ObjectId;
  timezone: string;
  locale: 'ru' | 'en';
  billing?: {
    vatNumber?: string;
    address?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface BranchWorkHours {
  open: string;
  close: string;
  closed?: boolean;
}

export interface Branch {
  _id: ObjectId;
  companyId: ObjectId;
  name: string;
  code?: string;
  address?: string;
  timezone?: string;
  workHours?: Record<string, BranchWorkHours>;
  kdsLines?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  sub: ObjectId;
  companyId: ObjectId;
  role: UserRole;
  exp: number;
  iat: number;
}
