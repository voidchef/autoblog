import { Job } from 'bullmq';
import Blog from '../../blog/blog.model';
import cacheService from '../../cache/cache.service';
import logger from '../../logger/logger';
import { TTSService } from '../../tts/tts.service';
import { TTSGenerationJobData } from '../queue.interfaces';

/**
 * Process TTS generation job
 */
export async function processTTSGenerationJob(job: Job<TTSGenerationJobData>): Promise<void> {
  const { blogId, text, config } = job.data;

  try {
    logger.info(`Processing TTS generation for blog: ${blogId}`);

    const ttsService = new TTSService();
    const result = await ttsService.textToSpeech(text, blogId, config);

    // Update blog with audio URL and status
    await Blog.findByIdAndUpdate(blogId, {
      audioNarrationUrl: result.audioUrl,
      audioGenerationStatus: 'completed',
    });

    // Clear cache for this blog to ensure fresh data is fetched
    await cacheService.del(`blog:${blogId}`);
    
    // Also clear the blog by slug cache if the blog exists
    const blog = await Blog.findById(blogId);
    if (blog?.slug) {
      await cacheService.del(`blog:slug:${blog.slug}`);
    }

    logger.info(`TTS generation completed for blog: ${blogId}, audio URL: ${result.audioUrl}`);
  } catch (error) {
    logger.error(`Error in TTS generation job for blog ${blogId}:`, error);
    
    // Update blog with failed status
    try {
      await Blog.findByIdAndUpdate(blogId, {
        audioGenerationStatus: 'failed',
      });
      
      // Clear cache to ensure fresh data is fetched
      await cacheService.del(`blog:${blogId}`);
    } catch (updateError) {
      logger.error(`Failed to update blog status for ${blogId}:`, updateError);
    }
    
    throw error;
  }
}
