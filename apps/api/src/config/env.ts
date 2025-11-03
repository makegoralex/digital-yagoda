import 'dotenv/config';

function requireEnv(key: string, defaultValue?: string) {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required env var ${key}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(requireEnv('PORT', '3000')),
  mongoUri: requireEnv('MONGO_URI'),
  jwtSecret: requireEnv('JWT_SECRET'),
  jwtAccessTtl: Number(requireEnv('JWT_ACCESS_TTL', '900')),
  jwtRefreshTtl: Number(requireEnv('JWT_REFRESH_TTL', '2592000')),
  corsOrigins: requireEnv('CORS_ORIGINS', '').split(',').filter(Boolean)
};
