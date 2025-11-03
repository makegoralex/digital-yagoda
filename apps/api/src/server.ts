import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { connectToDatabase } from './database/connection';

async function bootstrap() {
  try {
    await connectToDatabase();
    const app = createApp();
    app.listen(env.port, () => {
      logger.info(`API listening on port ${env.port}`);
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

void bootstrap();
