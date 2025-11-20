import { Job } from 'bullmq';
import mongoose from 'mongoose';
import S3Utils from '../../aws/S3Utils';
import Blog from '../../blog/blog.model';
import { generateBlogContent, generateBlogContentFromTemplate } from '../../blog/blog.service';
import logger from '../../logger/logger';
import { BlogGenerationJobData } from '../queue.interfaces';

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
    await Blog.findByIdAndUpdate(blogId, {
      title: blogContent['title'],
      slug: blogContent['slug'],
      seoTitle: blogContent['seoTitle'],
      seoDescription: blogContent['seoDescription'],
      content: blogContent['content'],
      images: uploadedImages,
      generationStatus: 'completed',
    });

    logger.info(`Blog generation completed successfully for blog: ${blogId}`);
  } catch (error) {
    logger.error(`Error in blog generation job for blog ${blogId}:`, error);

    // Update blog with error status
    try {
      await Blog.findByIdAndUpdate(blogId, {
        generationStatus: 'failed',
        content: `Failed to generate blog content. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } catch (updateError) {
      logger.error(`Failed to update blog status for ${blogId}:`, updateError);
    }

    throw error; // Re-throw to mark job as failed
  }
}
