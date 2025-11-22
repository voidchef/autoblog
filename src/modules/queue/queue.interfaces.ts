import { Job, JobsOptions } from 'bullmq';

/**
 * Queue names enum
 */
export enum QueueName {
  BLOG_GENERATION = 'blog-generation',
  EMAIL = 'email',
  IMAGE_GENERATION = 'image-generation',
  TTS_GENERATION = 'tts-generation',
}

/**
 * Base job data interface
 */
export interface BaseJobData {
  jobId?: string;
  timestamp?: number;
}

/**
 * Blog generation job data
 */
export interface BlogGenerationJobData extends BaseJobData {
  blogId: string;
  authorId: string;
  generateBlogData: any;
  isTemplate: boolean;
}

/**
 * Email job data
 */
export interface EmailJobData extends BaseJobData {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/**
 * Image generation job data
 */
export interface ImageGenerationJobData extends BaseJobData {
  blogId: string;
  images: string[];
  uploadPath: string;
}

/**
 * TTS generation job data
 */
export interface TTSGenerationJobData extends BaseJobData {
  blogId: string;
  text: string;
  config?: any;
}

/**
 * Queue configuration
 */
export interface QueueConfig {
  connection?: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
  defaultJobOptions?: JobsOptions;
}

/**
 * Queue service interface
 */
export interface IQueueService {
  initialize(): Promise<void>;
  addJob(queueName: QueueName, data: any, options?: JobsOptions): Promise<Job>;
  shutdown(): Promise<void>;
  getJob(queueName: QueueName, jobId: string): Promise<Job | undefined>;
  removeJob(queueName: QueueName, jobId: string): Promise<void>;
}
