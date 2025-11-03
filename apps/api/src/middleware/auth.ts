import { Request, Response, NextFunction } from 'express';

import { verifyToken } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    companyId: string;
    role: string;
    tokenVersion: number;
  };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const [, token] = authHeader.split(' ');
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const payload = verifyToken<{ sub: string; companyId: string; role: string; tokenVersion: number }>(
      token
    );
    req.user = {
      userId: payload.sub,
      companyId: payload.companyId,
      role: payload.role,
      tokenVersion: payload.tokenVersion
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}
