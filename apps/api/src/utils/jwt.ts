import jwt from 'jsonwebtoken';

import { env } from '../config/env';

interface TokenPayload {
  sub: string;
  companyId: string;
  role: string;
  tokenVersion: number;
}

export function signAccessToken(payload: TokenPayload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtAccessTtl });
}

export function signRefreshToken(payload: TokenPayload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtRefreshTtl });
}

export function verifyToken<T>(token: string) {
  return jwt.verify(token, env.jwtSecret) as T;
}
