import { createClient, RedisClientType } from 'redis';
import logger from '../logger/logger';
import { ICacheService } from './cache.interfaces';

/**
 * Redis cache implementation
 */
class RedisCache implements ICacheService {
  private client: RedisClientType;
  private isReady: boolean = false;

  constructor(host: string, port: number, username?: string, password?: string, db: number = 0, tls = false) {
    const config: any = {
      socket: {
        host,
        port,
        tls,
        reconnectStrategy: (retries: number) => {
          const delay = Math.min(retries * 50, 2000);
          return delay;
        },
      },
      database: db,
    };

    if (username && password) {
      config.username = username;
      config.password = password;
    }

    this.client = createClient(config);

    this.client.on('connect', () => {
      logger.info('Redis cache connected');
    });

    this.client.on('ready', () => {
      logger.info('Redis cache ready');
      this.isReady = true;
    });

    this.client.on('error', (error: Error) => {
      logger.error('Redis cache error:', error);
    });

    this.client.on('end', () => {
      logger.warn('Redis cache connection closed');
      this.isReady = false;
    });

    // Connect to Redis
    this.client.connect().catch((error: Error) => {
      logger.error('Failed to connect to Redis:', error);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.client.get(key);
      if (!cached) {
        return null;
      }
      return JSON.parse(cached) as T;
    } catch (error) {
      logger.error(`Redis get error for key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.client.setEx(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (error) {
      logger.error(`Redis set error for key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error(`Redis del error for key ${key}:`, error);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      logger.error(`Redis delPattern error for pattern ${pattern}:`, error);
    }
  }

  async clear(): Promise<void> {
    try {
      await this.client.flushDb();
    } catch (error) {
      logger.error('Redis clear error:', error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
      this.isReady = false;
      logger.info('Redis cache disconnected');
    } catch (error) {
      logger.error('Redis disconnect error:', error);
    }
  }

  getClient(): RedisClientType {
    return this.client;
  }
}

export default RedisCache;
