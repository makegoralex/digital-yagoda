import mongoose from 'mongoose';

import { env } from '../config/env';
import { logger } from '../config/logger';

export async function connectToDatabase() {
  await mongoose.connect(env.mongoUri);
  logger.info('Connected to MongoDB');
}

export async function disconnectFromDatabase() {
  await mongoose.disconnect();
}
