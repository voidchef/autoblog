import { Job } from 'bullmq';
import S3Utils from '../../aws/S3Utils';
import logger from '../../logger/logger';
import { ImageGenerationJobData } from '../queue.interfaces';

/**
 * Process image generation job
 */
export async function processImageGenerationJob(job: Job<ImageGenerationJobData>): Promise<void> {
  const { blogId, images, uploadPath } = job.data;

  try {
    logger.info(`Processing image generation for blog: ${blogId}`);

    const uploadResult = await S3Utils.uploadFromUrlsOrFiles({
      sources: images,
      blogId,
      uploadPath,
    });

    if (uploadResult.errors.length > 0) {
      logger.warn(`Some images failed to upload for blog ${blogId}:`, uploadResult.errors);
    }

    logger.info(`Image generation completed for blog: ${blogId}, uploaded ${uploadResult.uploadedUrls.length} images`);

    return uploadResult as any;
  } catch (error) {
    logger.error(`Error in image generation job for blog ${blogId}:`, error);
    throw error;
  }
}
