import { Queue, Worker, Job, ConnectionOptions } from 'bullmq';
import config from '../../config/config';
import logger from '../logger/logger';
import {
  QueueName,
  IQueueService,
  BlogGenerationJobData,
  EmailJobData,
  ImageGenerationJobData,
  TTSGenerationJobData,
} from './queue.interfaces';

/**
 * Queue service that manages BullMQ queues and workers
 * Uses Redis if configured, otherwise uses in-memory mode
 */
class QueueService implements IQueueService {
  private queues: Map<QueueName, Queue> = new Map();
  private workers: Map<QueueName, Worker> = new Map();
  private connection: ConnectionOptions | undefined;
  private isInitialized: boolean = false;

  constructor() {
    // Only configure Redis connection if using Redis cache
    if (config.cache.type === 'redis' && config.cache.redis) {
      this.connection = {
        host: config.cache.redis.host,
        port: config.cache.redis.port,
        password: config.cache.redis.password,
        db: config.cache.redis.db,
      };
    }
  }

  /**
   * Initialize all queues and workers
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('Queue service already initialized');
      return;
    }

    try {
      // Only create queues if Redis is available
      if (this.connection) {
        logger.info('Initializing BullMQ with Redis connection');

        // Create queues
        this.createQueue(QueueName.BLOG_GENERATION);
        this.createQueue(QueueName.EMAIL);
        this.createQueue(QueueName.IMAGE_GENERATION);
        this.createQueue(QueueName.TTS_GENERATION);

        // Register workers
        await this.registerWorkers();

        this.isInitialized = true;
        logger.info('Queue service initialized with Redis');
      } else {
        logger.info('Queue service disabled (in-memory cache mode)');
        this.isInitialized = false;
      }
    } catch (error) {
      logger.error('Failed to initialize queue service:', error);
      throw error;
    }
  }

  /**
   * Create a queue
   */
  private createQueue(queueName: QueueName): void {
    const queue = new Queue(queueName, {
      connection: this.connection!,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: {
          age: 3600, // Keep completed jobs for 1 hour
          count: 100,
        },
        removeOnFail: {
          age: 86400, // Keep failed jobs for 24 hours
        },
      },
    });

    this.queues.set(queueName, queue);
    logger.info(`Queue created: ${queueName}`);
  }

  /**
   * Register all workers
   */
  private async registerWorkers(): Promise<void> {
    // Blog generation worker
    this.registerWorker(QueueName.BLOG_GENERATION, async (job: Job<BlogGenerationJobData>) => {
      logger.info(`Processing blog generation job: ${job.id}`);
      const { processBlogGenerationJob } = await import('./workers/blog-generation.worker.js');
      return processBlogGenerationJob(job);
    });

    // Email worker
    this.registerWorker(QueueName.EMAIL, async (job: Job<EmailJobData>) => {
      logger.info(`Processing email job: ${job.id}`);
      const { processEmailJob } = await import('./workers/email.worker.js');
      return processEmailJob(job);
    });

    // Image generation worker
    this.registerWorker(QueueName.IMAGE_GENERATION, async (job: Job<ImageGenerationJobData>) => {
      logger.info(`Processing image generation job: ${job.id}`);
      const { processImageGenerationJob } = await import('./workers/image-generation.worker.js');
      return processImageGenerationJob(job);
    });

    // TTS generation worker
    this.registerWorker(QueueName.TTS_GENERATION, async (job: Job<TTSGenerationJobData>) => {
      logger.info(`Processing TTS generation job: ${job.id}`);
      const { processTTSGenerationJob } = await import('./workers/tts-generation.worker.js');
      return processTTSGenerationJob(job);
    });

    logger.info('All workers registered');
  }

  /**
   * Register a worker for a queue
   */
  private registerWorker(queueName: QueueName, processor: (job: Job) => Promise<any>): void {
    const worker = new Worker(queueName, processor, {
      connection: this.connection!,
      concurrency: this.getWorkerConcurrency(queueName),
    });

    worker.on('completed', (job: Job) => {
      logger.info(`Job completed: ${job.id} in queue ${queueName}`);
    });

    worker.on('failed', (job: Job | undefined, err: Error) => {
      logger.error(`Job failed: ${job?.id} in queue ${queueName}`, err);
    });

    this.workers.set(queueName, worker);
  }

  /**
   * Get worker concurrency based on queue type
   */
  private getWorkerConcurrency(queueName: QueueName): number {
    switch (queueName) {
      case QueueName.BLOG_GENERATION:
        return 2; // Limit blog generation to 2 concurrent jobs
      case QueueName.EMAIL:
        return 5; // Allow 5 concurrent email sends
      case QueueName.IMAGE_GENERATION:
        return 3; // Limit image generation
      case QueueName.TTS_GENERATION:
        return 2; // Limit TTS generation
      default:
        return 1;
    }
  }

  /**
   * Add a job to a queue
   */
  async addJob(queueName: QueueName, data: any, options?: any): Promise<Job> {
    if (!this.isInitialized) {
      throw new Error('Queue service not initialized. Using in-memory cache mode.');
    }

    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue not found: ${queueName}`);
    }

    const job = await queue.add(queueName, data, options);
    logger.info(`Job added to ${queueName}: ${job.id}`);
    return job;
  }

  /**
   * Get a job by ID
   */
  async getJob(queueName: QueueName, jobId: string): Promise<Job | undefined> {
    if (!this.isInitialized) {
      return undefined;
    }

    const queue = this.queues.get(queueName);
    if (!queue) {
      return undefined;
    }

    return queue.getJob(jobId);
  }

  /**
   * Remove a job
   */
  async removeJob(queueName: QueueName, jobId: string): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    const queue = this.queues.get(queueName);
    if (!queue) {
      return;
    }

    const job = await queue.getJob(jobId);
    if (job) {
      await job.remove();
      logger.info(`Job removed from ${queueName}: ${jobId}`);
    }
  }

  /**
   * Check if queue service is available
   */
  isAvailable(): boolean {
    return this.isInitialized;
  }

  /**
   * Shutdown all queues and workers
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down queue service...');

    // Close all workers
    for (const [name, worker] of this.workers.entries()) {
      try {
        await worker.close();
        logger.info(`Worker closed: ${name}`);
      } catch (error) {
        logger.error(`Error closing worker ${name}:`, error);
      }
    }

    // Close all queues
    for (const [name, queue] of this.queues.entries()) {
      try {
        await queue.close();
        logger.info(`Queue closed: ${name}`);
      } catch (error) {
        logger.error(`Error closing queue ${name}:`, error);
      }
    }

    this.queues.clear();
    this.workers.clear();
    this.isInitialized = false;

    logger.info('Queue service shut down');
  }
}

// Export singleton instance
const queueService = new QueueService();
export default queueService;
