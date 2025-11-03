import { UserDocument } from '../models/user.model';
import { signAccessToken, signRefreshToken } from '../utils/jwt';

export function createTokens(user: UserDocument & { companyId: NonNullable<UserDocument['companyId']> }) {
  const payload = {
    sub: user._id.toString(),
    companyId: user.companyId.toString(),
    role: user.role,
    tokenVersion: user.tokenVersion
  };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload)
  };
}
