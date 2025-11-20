import NodeCache from 'node-cache';
import logger from '../logger/logger';
import { ICacheService } from './cache.interfaces';

/**
 * In-memory cache implementation using node-cache
 * Provides automatic TTL management and cleanup
 */
class MemoryCache implements ICacheService {
  private cache: NodeCache;

  constructor(defaultTTL: number = 3600) {
    this.cache = new NodeCache({
      stdTTL: defaultTTL,
      checkperiod: 120, // Check for expired keys every 120 seconds
      useClones: false, // Better performance, but be careful with object mutations
    });

    // Event listeners
    this.cache.on('set', (key: string) => {
      logger.debug(`Cache set: ${key}`);
    });

    this.cache.on('del', (key: string) => {
      logger.debug(`Cache deleted: ${key}`);
    });

    this.cache.on('expired', (key: string) => {
      logger.debug(`Cache expired: ${key}`);
    });

    logger.info('Memory cache initialized with node-cache');
  }

  async get<T>(key: string): Promise<T | null> {
    const value = this.cache.get<T>(key);
    return value !== undefined ? value : null;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    this.cache.set(key, value, ttl || 0);
  }

  async del(key: string): Promise<void> {
    this.cache.del(key);
  }

  async delPattern(pattern: string): Promise<void> {
    // Convert glob pattern to regex
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    const keys = this.cache.keys();
    const keysToDelete = keys.filter((key: string) => regex.test(key));

    if (keysToDelete.length > 0) {
      this.cache.del(keysToDelete);
      logger.debug(`Deleted ${keysToDelete.length} keys matching pattern: ${pattern}`);
    }
  }

  async clear(): Promise<void> {
    this.cache.flushAll();
    logger.info('Memory cache cleared');
  }

  async disconnect(): Promise<void> {
    this.cache.flushAll();
    this.cache.close();
    logger.info('Memory cache disconnected');
  }

  // Get cache statistics
  getStats() {
    return this.cache.getStats();
  }
}

export default MemoryCache;
