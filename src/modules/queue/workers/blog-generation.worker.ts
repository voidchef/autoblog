import { Job } from 'bullmq';
import mongoose from 'mongoose';
import S3Utils from '../../aws/S3Utils';
import Blog from '../../blog/blog.model';
import { generateBlogContent, generateBlogContentFromTemplate } from '../../blog/blog.service';
import { cacheService } from '../../cache';
import logger from '../../logger/logger';
import { BlogGenerationJobData, QueueName, TTSGenerationJobData } from '../queue.interfaces';
import queueService from '../queue.service';

/**
 * Process blog generation job
 */
export async function processBlogGenerationJob(job: Job<BlogGenerationJobData>): Promise<void> {
  const { blogId, authorId, generateBlogData, isTemplate } = job.data;

  try {
    logger.info(`Starting blog generation for blog: ${blogId}`);

    const author = new mongoose.Types.ObjectId(authorId);
    let blogContent: { generatedImages?: string[]; [key: string]: any };

    // Generate content based on type
    if (isTemplate) {
      blogContent = await generateBlogContentFromTemplate(generateBlogData, author);
    } else {
      blogContent = await generateBlogContent(generateBlogData, author);
    }

    // Upload images if any
    let uploadedImages: string[] = [];
    if (blogContent.generatedImages && blogContent.generatedImages.length > 0) {
      const uploadResult = await S3Utils.uploadFromUrlsOrFiles({
        sources: blogContent.generatedImages,
        blogId,
        uploadPath: `blogs/${blogId}`,
      });
      if (uploadResult.uploadedUrls.length > 0) {
        uploadedImages = uploadResult.uploadedUrls;
      }
    }

    // Update the blog with generated content
    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      {
        title: blogContent['title'],
        slug: blogContent['slug'],
        seoTitle: blogContent['seoTitle'],
        seoDescription: blogContent['seoDescription'],
        content: blogContent['content'],
        images: uploadedImages,
        generatedImages: uploadedImages.length > 0 ? uploadedImages : blogContent['generatedImages'],
        selectedImage: uploadedImages.length > 0 ? uploadedImages[0] : undefined,
        generationStatus: 'completed',
        audioGenerationStatus: 'processing',
      },
      { new: true }
    );

    // Invalidate cache for this blog
    await cacheService.del(`blog:id:${blogId}`);
    if (updatedBlog?.slug) {
      await cacheService.del(`blog:slug:${updatedBlog.slug}`);
    }
    // Invalidate query caches
    await cacheService.delPattern('blog:query:*');
    await cacheService.delPattern('blog:stats:*');

    logger.info(`Blog generation completed successfully for blog: ${blogId}`);

    // Add TTS generation job to queue
    try {
      const ttsJobData: TTSGenerationJobData = {
        blogId,
        text: blogContent['content'],
        config: {
          languageCode: generateBlogData.language === 'en' ? 'en-US' : generateBlogData.language || 'en-US',
        },
      };
      
      await queueService.addJob(QueueName.TTS_GENERATION, ttsJobData);
      logger.info(`TTS generation job queued for blog: ${blogId}`);
    } catch (ttsError) {
      logger.error(`Failed to queue TTS generation for blog ${blogId}:`, ttsError);
      // Don't fail the blog generation if TTS queueing fails
      await Blog.findByIdAndUpdate(blogId, {
        audioGenerationStatus: 'failed',
      });
    }
  } catch (error) {
    // Log detailed error information
    if (error instanceof Error) {
      logger.error(`Error in blog generation job for blog ${blogId}:`, {
        message: error.message,
        name: error.name,
        cause: (error as any).cause,
        stack: error.stack,
      });
    } else {
      logger.error(`Error in blog generation job for blog ${blogId}:`, error);
    }

    // Delete the placeholder blog since generation failed
    try {
      await Blog.findByIdAndDelete(blogId);
      logger.info(`Deleted failed blog ${blogId} from database`);
    } catch (deleteError) {
      logger.error(`Failed to delete blog ${blogId}:`, deleteError);
      // If deletion fails, at least mark it as failed
      try {
        await Blog.findByIdAndUpdate(blogId, {
          generationStatus: 'failed',
          content: `Failed to generate blog content. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      } catch (updateError) {
        logger.error(`Failed to update blog status for ${blogId}:`, updateError);
      }
    }

    throw error; // Re-throw to mark job as failed
  }
}
