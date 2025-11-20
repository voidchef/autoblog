import config from '../../config/config';
import logger from '../logger/logger';
import { ICacheService } from './cache.interfaces';
import MemoryCache from './memory-cache';
import RedisCache from './redis-cache';

/**
 * Cache service that provides a unified interface for caching
 * Supports both Redis and in-memory caching based on configuration
 */
class CacheService implements ICacheService {
  private cacheImpl: ICacheService;
  private type: 'redis' | 'memory';

  constructor() {
    this.type = config.cache.type;

    if (this.type === 'redis' && config.cache.redis) {
      try {
        this.cacheImpl = new RedisCache(
          config.cache.redis.host,
          config.cache.redis.port,
          config.cache.redis.password,
          config.cache.redis.db
        );
        logger.info('Cache service initialized with Redis');
      } catch (error) {
        logger.error('Failed to initialize Redis cache, falling back to memory cache:', error);
        this.cacheImpl = new MemoryCache(config.cache.defaultTTL);
        this.type = 'memory';
      }
    } else {
      this.cacheImpl = new MemoryCache(config.cache.defaultTTL);
      logger.info('Cache service initialized with in-memory cache');
    }
  }

  getCacheType(): 'redis' | 'memory' {
    return this.type;
  }

  async get<T>(key: string): Promise<T | null> {
    return this.cacheImpl.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const finalTtl = ttl ?? config.cache.defaultTTL;
    await this.cacheImpl.set(key, value, finalTtl);
  }

  async del(key: string): Promise<void> {
    await this.cacheImpl.del(key);
  }

  async delPattern(pattern: string): Promise<void> {
    await this.cacheImpl.delPattern(pattern);
  }

  async clear(): Promise<void> {
    await this.cacheImpl.clear();
  }

  async disconnect(): Promise<void> {
    await this.cacheImpl.disconnect();
  }

  /**
   * Wrap a function with caching
   * @param key Cache key
   * @param fn Function to execute if cache miss
   * @param ttl Time to live in seconds
   * @returns Cached or fresh data
   */
  async wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const result = await fn();
    await this.set(key, result, ttl);
    return result;
  }

  /**
   * Generate a cache key from parts
   * @param parts Key components
   * @returns Formatted cache key
   */
  static generateKey(...parts: (string | number | undefined)[]): string {
    return parts
      .filter((part) => part !== undefined)
      .map((part) => String(part))
      .join(':');
  }
}

// Export singleton instance
const cacheService = new CacheService();
export default cacheService;
