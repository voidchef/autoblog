import { Job } from 'bullmq';
import Blog from '../../blog/blog.model';
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

    // Update blog with audio URL
    await Blog.findByIdAndUpdate(blogId, {
      audioUrl: result.audioUrl,
    });

    logger.info(`TTS generation completed for blog: ${blogId}, audio URL: ${result.audioUrl}`);
  } catch (error) {
    logger.error(`Error in TTS generation job for blog ${blogId}:`, error);
    throw error;
  }
}
