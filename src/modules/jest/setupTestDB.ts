import mongoose from 'mongoose';
import config from '../../config/config';
import { cacheService } from '../cache';

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
    await mongoose.disconnect();
  });
};

export default setupTestDB;
