import config from '../../config/config';
import logger from '../logger/logger';
import { ICacheService } from './cache.interfaces';
import RedisCache from './redis-cache';

/**
 * Cache service that provides a unified interface for caching
 * Uses Redis for all caching operations
 */
class CacheService implements ICacheService {
  private cacheImpl: ICacheService;

  constructor() {
    this.cacheImpl = new RedisCache(
      config.cache.redis.host,
      config.cache.redis.port,
      config.cache.redis.username,
      config.cache.redis.password,
      config.cache.redis.db,
      config.cache.redis.tls
    );
    logger.info('Cache service initialized with Redis');
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
