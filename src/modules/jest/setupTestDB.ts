import mongoose from 'mongoose';
import config from '../../config/config';
import { cacheService } from '../cache';
import { queueService } from '../queue';

const setupTestDB = () => {
  beforeAll(async () => {
    await mongoose.connect(config.mongoose.url);
  });

  beforeEach(async () => {
    await Promise.all(
      Object.values(mongoose.connection.collections).map(async (collection) => collection.deleteMany({}))
    );
    // Clear cache to prevent cached data from affecting tests
    await cacheService.clear();
  });

  afterAll(async () => {
    // Disconnect from MongoDB
    await mongoose.disconnect();

    // Disconnect cache service (Redis)
    await cacheService.disconnect();

    // Shutdown queue service
    await queueService.shutdown();
  });
};

export default setupTestDB;
