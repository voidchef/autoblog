import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './config/config';
import { cacheService } from './modules/cache';
import logger from './modules/logger/logger';
import { queueService } from './modules/queue';

let server: Server;
void mongoose.connect(config.mongoose.url).then(() => {
  logger.info('Connected to MongoDB');
  server = app.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
  });
});

const exitHandler = async () => {
  if (server) {
    server.close(async () => {
      logger.info('Server closed');

      // Gracefully shutdown queue service
      if (queueService.isAvailable()) {
        await queueService.shutdown();
      }

      // Disconnect cache service
      await cacheService.disconnect();

      process.exit(1);
    });
  } else {
    // Shutdown services even if server is not running
    if (queueService.isAvailable()) {
      await queueService.shutdown();
    }
    await cacheService.disconnect();
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: string) => {
  logger.error(error);
  void exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close(async () => {
      logger.info('Server closed gracefully');

      // Gracefully shutdown queue service
      if (queueService.isAvailable()) {
        await queueService.shutdown();
      }

      // Disconnect cache service
      await cacheService.disconnect();
    });
  }
});
