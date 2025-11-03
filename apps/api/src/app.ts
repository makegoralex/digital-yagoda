import cors from 'cors';
import express from 'express';
import pinoHttp from 'pino-http';

import { env } from './config/env';
import { logger } from './config/logger';
import { authRouter } from './routes/auth.routes';
import { branchRouter } from './routes/branch.routes';
import { companyRouter } from './routes/company.routes';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.corsOrigins.length ? env.corsOrigins : undefined,
      credentials: true
    })
  );
  app.use(express.json());
  app.use(pinoHttp({ logger }));

  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/companies', companyRouter);
  app.use('/api/v1/branches', branchRouter);

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error({ err }, 'Unhandled error');
    res.status(500).json({ message: 'Internal server error' });
  });

  return app;
}
