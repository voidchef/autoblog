import httpStatus from 'http-status';
import mongoose from 'mongoose';
import S3Utils from '../aws/S3Utils';
import { cacheService } from '../cache';
import ApiError from '../errors/ApiError';
import logger from '../logger/logger';
import { mediumService } from '../medium';
import { IOptions, QueryResult } from '../paginate/paginate';
import {
  PostGenerator,
  Post,
  AutoPostPrompt,
  PostTemplateGenerator,
  TemplatePost,
  TemplatePostPrompt,
} from '../postGen';
import { queueService, QueueName } from '../queue';
import User from '../user/user.model';
import { getUserById, getUserByIdFresh } from '../user/user.service';
import runReport, {
  IRunReportResponse,
  getAnalyticsOverview,
  getBlogPageViews,
  getTrafficSources,
  getDailyTrends,
  getEventAnalytics,
} from '../utils/analytics';
import { wordpressService } from '../wordpress';
import { IGenerateBlog, IGenerateTemplateBlog, NewCreatedBlog, UpdateBlogBody, IBlogDoc } from './blog.interfaces';
import Blog from './blog.model';

/**
 * Create a blog post
 * @param {NewCreatedBlog} blogBody
 * @returns {Promise<IBlogDoc>}
 */
export const createBlog = async (blogBody: NewCreatedBlog): Promise<IBlogDoc> => {
  const blog = await Blog.create(blogBody);
  if (blog.generatedImages && blog.generatedImages.length > 0) {
    // Upload generated images to S3
    const uploadResult = await S3Utils.uploadFromUrlsOrFiles({
      sources: blog.generatedImages,
      blogId: blog.id,
      uploadPath: `blogs/${blog._id}`,
    });
    if (uploadResult.uploadedUrls.length > 0) {
      blog.generatedImages = uploadResult.uploadedUrls;
      blog.selectedImage = uploadResult.uploadedUrls[0]!; // Set the first uploaded image
    }
  }
  await blog.save();

  // Invalidate cache for blog queries
  await cacheService.delPattern('blog:query:*');
  await cacheService.delPattern('blog:stats:*');

  return blog;
};

/**
 * Generate blog content (without creating DB entry)
 * @param {IGenerateBlog} generateBlogData
 * @param {mongoose.Types.ObjectId} author
 * @returns {Promise<NewCreatedBlog>}
 */
export const generateBlogContent = async (
  generateBlogData: IGenerateBlog,
  author: mongoose.Types.ObjectId
): Promise<NewCreatedBlog> => {
  // Get the user to retrieve the decrypted API key (use fresh data, not cached)
  const user = await getUserByIdFresh(author);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const { llmProvider } = generateBlogData;
  let decryptedApiKey: string;

  // Determine which API key to use based on the provider field
  if (llmProvider === 'google') {
    // Google GenAI models
    if (!user.hasGoogleApiKey) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Google API key is required for Gemini models');
    }
    decryptedApiKey = user.getDecryptedGoogleApiKey();
    if (!decryptedApiKey) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to decrypt Google API key');
    }
  } else if (llmProvider === 'mistral') {
    // Mistral models - using OpenAI key field for now, could be extended
    if (!user.hasOpenAiKey) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Mistral API key is required for Mistral models');
    }
    decryptedApiKey = user.getDecryptedOpenAiKey();
    if (!decryptedApiKey) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to decrypt Mistral API key');
    }
  } else {
    // OpenAI models (default)
    if (!user.hasOpenAiKey) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'OpenAI API key is required for blog generation');
    }
    decryptedApiKey = user.getDecryptedOpenAiKey();
    if (!decryptedApiKey) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to decrypt OpenAI API key');
    }
  }

  const { category, tags, ...prompt } = generateBlogData;
  // Ensure 'model' property is present for AutoPostPrompt and add the decrypted API key
  const postPrompt: AutoPostPrompt = {
    ...prompt,
    model: prompt.llmModel, // Map llmModel to model for PostGenerator
    apiKey: decryptedApiKey, // Add the decrypted API key
    generateImages: true, // Default to generating images
  };
  const postGenerator = new PostGenerator(postPrompt);
  const post: Post = await postGenerator.generate();
  const additionalData: { category: string; author: mongoose.Types.ObjectId; tags?: string[] } = { category, author };
  if (tags) {
    additionalData.tags = Array.isArray(tags)
      ? tags.map((tag: string) => tag.trim())
      : String(tags)
          .split(/\s*,\s*/)
          .map((tag: string) => tag.trim());
  }
  return { ...post, ...generateBlogData, ...additionalData } as NewCreatedBlog;
};

/**
 * Generate a blog post
 * @param {IGenerateBlog} generateBlogData
 * @param {mongoose.Types.ObjectId} author
 * @returns {Promise<IBlogDoc>}
 */
export const generateBlog = async (
  generateBlogData: IGenerateBlog,
  author: mongoose.Types.ObjectId
): Promise<IBlogDoc> => {
  const blogContent = await generateBlogContent(generateBlogData, author);
  return createBlog(blogContent);
};

/**
 * Generate blog content from template (without creating DB entry)
 * @param {IGenerateTemplateBlog} generateTemplateData
 * @param {mongoose.Types.ObjectId} author
 * @returns {Promise<NewCreatedBlog>}
 */
export const generateBlogContentFromTemplate = async (
  generateTemplateData: IGenerateTemplateBlog,
  author: mongoose.Types.ObjectId
): Promise<NewCreatedBlog> => {
  // Get the user to retrieve the decrypted API key (use fresh data, not cached)
  const user = await getUserByIdFresh(author);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const { llmProvider } = generateTemplateData;
  let decryptedApiKey: string;

  // Determine which API key to use based on the provider field
  if (llmProvider === 'google') {
    if (!user.hasGoogleApiKey) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Google API key is required for Gemini models');
    }
    decryptedApiKey = user.getDecryptedGoogleApiKey();
    if (!decryptedApiKey) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to decrypt Google API key');
    }
  } else if (llmProvider === 'mistral') {
    if (!user.hasOpenAiKey) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Mistral API key is required for Mistral models');
    }
    decryptedApiKey = user.getDecryptedOpenAiKey();
    if (!decryptedApiKey) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to decrypt Mistral API key');
    }
  } else {
    // OpenAI models (default)
    if (!user.hasOpenAiKey) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'OpenAI API key is required for template blog generation');
    }
    decryptedApiKey = user.getDecryptedOpenAiKey();
    if (!decryptedApiKey) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to decrypt OpenAI API key');
    }
  }

  const { category, tags, templateFile, input, generateImages, generateHeadingImages, imagesPerSection, ...rest } =
    generateTemplateData;

  // Create TemplatePostPrompt for PostTemplateGenerator
  const postPrompt: TemplatePostPrompt = {
    ...rest,
    model: generateTemplateData.llmModel,
    apiKey: decryptedApiKey,
    templateFile,
    input,
    generateImages: generateImages ?? true,
    generateHeadingImages: generateHeadingImages ?? false,
    imagesPerSection: imagesPerSection ?? 2,
  };

  const postGenerator = new PostTemplateGenerator(postPrompt);
  const post: TemplatePost = await postGenerator.generate();

  const additionalData: {
    category: string;
    author: mongoose.Types.ObjectId;
    tags?: string[];
    // Add empty values for required IGenerateBlog fields that don't apply to templates
    topic: string;
    language: string;
  } = {
    category,
    author,
    topic: post.title, // Use generated title as topic
    language: 'en', // Default language, could be passed in generateTemplateData if needed
  };

  if (tags) {
    additionalData.tags = Array.isArray(tags)
      ? tags.map((tag: string) => tag.trim())
      : String(tags)
          .split(/\s*,\s*/)
          .map((tag: string) => tag.trim());
  }

  return { ...post, ...generateTemplateData, ...additionalData } as NewCreatedBlog;
};

/**
 * Generate a blog post from a template file
 * @param {IGenerateTemplateBlog} generateTemplateData
 * @param {mongoose.Types.ObjectId} author
 * @returns {Promise<IBlogDoc>}
 */
export const generateBlogFromTemplate = async (
  generateTemplateData: IGenerateTemplateBlog,
  author: mongoose.Types.ObjectId
): Promise<IBlogDoc> => {
  const blogContent = await generateBlogContentFromTemplate(generateTemplateData, author);
  return createBlog(blogContent);
};

/**
 * Initiate blog generation asynchronously
 * @param {IGenerateBlog} generateBlogData
 * @param {mongoose.Types.ObjectId} author
 * @returns {Promise<IBlogDoc>}
 */
export const initiateBlogGeneration = async (
  generateBlogData: IGenerateBlog,
  author: mongoose.Types.ObjectId
): Promise<IBlogDoc> => {
  // Create a placeholder blog with 'processing' status
  const timestamp = Date.now();
  const placeholderBlog = await Blog.create({
    title: 'Generating...',
    slug: `generating-${timestamp}`,
    seoTitle: 'Generating...',
    seoDescription: 'Blog is being generated...',
    content: 'Blog content is being generated. Please wait...',
    author,
    category: generateBlogData.category,
    tags: generateBlogData.tags
      ? Array.isArray(generateBlogData.tags)
        ? generateBlogData.tags.map((tag: string) => tag.trim())
        : String(generateBlogData.tags)
            .split(/\s*,\s*/)
            .map((tag: string) => tag.trim())
      : [],
    generationStatus: 'processing',
    topic: generateBlogData.topic,
    language: generateBlogData.language,
    llmModel: generateBlogData.llmModel,
  });

  // Queue blog generation job
  await queueService.addJob(QueueName.BLOG_GENERATION, {
    blogId: placeholderBlog.id,
    authorId: author.toString(),
    generateBlogData,
    isTemplate: false,
  });
  logger.info(`Blog generation job queued for blog: ${placeholderBlog.id}`);

  return placeholderBlog;
};

/**
 * Initiate blog generation from template asynchronously
 * @param {IGenerateTemplateBlog} generateTemplateData
 * @param {mongoose.Types.ObjectId} author
 * @returns {Promise<IBlogDoc>}
 */
export const initiateBlogGenerationFromTemplate = async (
  generateTemplateData: IGenerateTemplateBlog,
  author: mongoose.Types.ObjectId
): Promise<IBlogDoc> => {
  // Create a placeholder blog with 'processing' status
  const timestamp = Date.now();
  const placeholderBlog = await Blog.create({
    title: 'Generating from template...',
    slug: `generating-template-${timestamp}`,
    seoTitle: 'Generating from template...',
    seoDescription: 'Blog is being generated from template...',
    content: 'Blog content is being generated from template. Please wait...',
    author,
    category: generateTemplateData.category,
    tags: generateTemplateData.tags
      ? Array.isArray(generateTemplateData.tags)
        ? generateTemplateData.tags.map((tag: string) => tag.trim())
        : String(generateTemplateData.tags)
            .split(/\s*,\s*/)
            .map((tag: string) => tag.trim())
      : [],
    generationStatus: 'processing',
    topic: 'Template Blog',
    language: 'en',
    llmModel: generateTemplateData.llmModel,
  });

  // Queue template blog generation job
  await queueService.addJob(QueueName.BLOG_GENERATION, {
    blogId: placeholderBlog.id,
    authorId: author.toString(),
    generateBlogData: generateTemplateData,
    isTemplate: true,
  });
  logger.info(`Template blog generation job queued for blog: ${placeholderBlog.id}`);

  return placeholderBlog;
};

/**
 * Query for blogs
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
export const queryBlogs = async (filter: Record<string, any>, options: IOptions): Promise<QueryResult> => {
  const blogs = await Blog.paginate(filter, options);
  return blogs;
};

/**
 * Query for blogs with stats (views, likes, comments)
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {mongoose.Types.ObjectId} userId - User ID for filtering by author
 * @returns {Promise<any>}
 */
export const queryBlogsWithStats = async (
  filter: Record<string, any>,
  options: IOptions,
  userId: mongoose.Types.ObjectId
): Promise<any> => {
  const Comment = mongoose.model('Comment');

  // Get blogs for the user
  const blogs = await Blog.paginate({ ...filter, author: userId }, options);

  // Calculate date range for GA views (last 90 days to get recent data)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 90);
  const startDateStr = startDate.toISOString().split('T')[0] || startDate.toISOString();
  const endDateStr = endDate.toISOString().split('T')[0] || endDate.toISOString();

  // Get views from Google Analytics
  let blogPageViews: Array<{ slug: string; views: number }> = [];
  try {
    blogPageViews = await getBlogPageViews(startDateStr, endDateStr);
  } catch (error) {
    logger.warn('Failed to fetch Google Analytics data for blogs:', error);
    // Continue without GA data
  }

  // Enrich blog data with views and comments
  const enrichedResults = await Promise.all(
    blogs.results.map(async (blog: any) => {
      const gaData = blogPageViews.find((bpv) => bpv.slug === blog.slug);
      const commentsCount = await Comment.countDocuments({ blog: blog._id });

      return {
        ...blog.toJSON(),
        views: gaData?.views || 0,
        commentsCount,
      };
    })
  );

  return {
    ...blogs,
    results: enrichedResults,
  };
};

/**
 * Get blog by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<IBlogDoc | null>}
 */
export const getBlogById = async (id: mongoose.Types.ObjectId): Promise<IBlogDoc | null> => {
  const cacheKey = `blog:id:${id.toString()}`;

  // Try to get from cache
  const cached = await cacheService.get<IBlogDoc>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from database
  const blog = await Blog.findById(id).populate('author');

  // Cache the result (30 minutes TTL for blog details)
  if (blog) {
    await cacheService.set(cacheKey, blog, 1800);
  }

  return blog;
};

/**
 * Get blog by slug
 * @param {mongoose.Types.ObjectId} slug
 * @returns {Promise<IBlogDoc | null>}
 */
export const getBlogBySlug = async (slug: string): Promise<IBlogDoc | null> => {
  const cacheKey = `blog:slug:${slug}`;

  // Try to get from cache
  const cached = await cacheService.get<IBlogDoc>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from database
  const blog = await Blog.findOne({ slug }).populate('author');

  // Cache the result (30 minutes TTL for blog details)
  if (blog) {
    await cacheService.set(cacheKey, blog, 1800);
  }

  return blog;
};

/**
 * Update blog by id
 * @param {mongoose.Types.ObjectId} blogId
 * @param {UpdateBlogBody} updateBody
 * @returns {Promise<IBlogDoc | null>}
 */
export const updateBlogById = async (
  blogId: mongoose.Types.ObjectId,
  updateBody: UpdateBlogBody
): Promise<IBlogDoc | null> => {
  // Fetch directly from DB to avoid cached document issues when saving
  const blog = await Blog.findById(blogId).populate('author');
  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
  }
  Object.assign(blog, updateBody);
  await blog.save();

  // Invalidate cache for this blog
  await cacheService.del(`blog:id:${blogId.toString()}`);
  if (blog.slug) {
    await cacheService.del(`blog:slug:${blog.slug}`);
  }
  // Invalidate query caches
  await cacheService.delPattern('blog:query:*');
  await cacheService.delPattern('blog:stats:*');

  return blog;
};

/**
 * Delete blog by id
 * @param {mongoose.Types.ObjectId} blogId
 * @returns {Promise<IBlogDoc | null>}
 */
export const deleteBlogById = async (blogId: mongoose.Types.ObjectId): Promise<IBlogDoc | null> => {
  // Fetch directly from DB to avoid cached document issues when deleting
  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
  }
  await blog.deleteOne();

  // Invalidate cache for this blog
  await cacheService.del(`blog:id:${blogId.toString()}`);
  if (blog.slug) {
    await cacheService.del(`blog:slug:${blog.slug}`);
  }
  // Invalidate query caches
  await cacheService.delPattern('blog:query:*');
  await cacheService.delPattern('blog:stats:*');

  return blog;
};

/**
 * Get Blog Views
 * @param {string} slug
 * @param {string} startDate
 * @param {string} endDate
 * @returns {Promise<IRunReportResponse | null>}
 */
export const getBlogViews = async (
  startDate: string,
  endDate: string,
  slug: string
): Promise<IRunReportResponse | null> => {
  const views = await runReport(startDate, endDate, slug);
  if (!views) {
    throw new Error('Error getting views');
  }
  return views;
};

/**
 * Like a blog
 * @param {mongoose.Types.ObjectId} blogId
 * @param {mongoose.Types.ObjectId} userId
 * @returns {Promise<IBlogDoc | null>}
 */
export const likeBlog = async (
  blogId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId
): Promise<IBlogDoc | null> => {
  // Fetch directly from DB to use instance methods
  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
  }
  await blog.toggleLike(userId);
  // Invalidate cache
  await cacheService.del(`blog:id:${blogId.toString()}`);
  await cacheService.del(`blog:slug:${blog.slug}`);
  return blog;
};

/**
 * Dislike a blog
 * @param {mongoose.Types.ObjectId} blogId
 * @param {mongoose.Types.ObjectId} userId
 * @returns {Promise<IBlogDoc | null>}
 */
export const dislikeBlog = async (
  blogId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId
): Promise<IBlogDoc | null> => {
  // Fetch directly from DB to use instance methods
  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
  }
  await blog.toggleDislike(userId);
  // Invalidate cache
  await cacheService.del(`blog:id:${blogId.toString()}`);
  await cacheService.del(`blog:slug:${blog.slug}`);
  return blog;
};

/**
 * Get blog engagement statistics
 * @param {string} slug - Blog slug
 * @returns {Promise<any>}
 */
export const getBlogEngagementStats = async (slug: string): Promise<any> => {
  const Comment = mongoose.model('Comment');

  const blog = await getBlogBySlug(slug);
  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
  }

  // Get engagement metrics for this specific blog
  const likesCount = blog.likes?.length || 0;
  const dislikesCount = blog.dislikes?.length || 0;

  // Get comments count for this blog
  const commentsCount = await Comment.countDocuments({ blog: blog._id });

  return {
    slug: blog.slug,
    title: blog.title,
    likesCount,
    dislikesCount,
    commentsCount,
    totalEngagement: likesCount + dislikesCount + commentsCount,
  };
};

/**
 * Get aggregate engagement statistics for all user's blogs
 * @param {mongoose.Types.ObjectId} userId - User ID
 * @returns {Promise<any>}
 */
export const getAllBlogsEngagementStats = async (userId: mongoose.Types.ObjectId): Promise<any> => {
  const Comment = mongoose.model('Comment');

  // Get all published blogs by the user
  const userBlogs = await Blog.find({ author: userId, isPublished: true }).select('_id likes dislikes');

  const totalBlogs = userBlogs.length;

  // Calculate total likes and dislikes across all blogs
  const totalLikes = userBlogs.reduce((sum, blog) => sum + (blog.likes?.length || 0), 0);
  const totalDislikes = userBlogs.reduce((sum, blog) => sum + (blog.dislikes?.length || 0), 0);

  // Get total comments across all user's blogs
  const blogIds = userBlogs.map((blog) => blog._id);
  const totalComments = await Comment.countDocuments({ blog: { $in: blogIds } });

  return {
    totalBlogs,
    totalLikes,
    totalDislikes,
    totalComments,
    totalEngagement: totalLikes + totalDislikes + totalComments,
    avgEngagementPerBlog:
      totalBlogs > 0 ? ((totalLikes + totalDislikes + totalComments) / totalBlogs).toFixed(2) : '0.00',
  };
};

/**
 * Get audio narration status for a blog post
 * @param {mongoose.Types.ObjectId} blogId - Blog ID
 * @returns {Promise<{audioNarrationUrl?: string | undefined, audioGenerationStatus?: string | undefined}>}
 */
export const getAudioNarrationStatus = async (
  blogId: mongoose.Types.ObjectId
): Promise<{ audioNarrationUrl?: string | undefined; audioGenerationStatus?: string | undefined }> => {
  const blog = await Blog.findById(blogId).select('audioNarrationUrl audioGenerationStatus');
  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
  }

  const result: { audioNarrationUrl?: string | undefined; audioGenerationStatus?: string | undefined } = {};
  if (blog.audioNarrationUrl) {
    result.audioNarrationUrl = blog.audioNarrationUrl;
  }
  if (blog.audioGenerationStatus) {
    result.audioGenerationStatus = blog.audioGenerationStatus;
  }
  return result;
};

/**
 * Publish a blog post to WordPress
 * @param {mongoose.Types.ObjectId} blogId - Blog ID
 * @param {mongoose.Types.ObjectId} userId - User ID
 * @param {object} wordpressConfig - WordPress configuration (optional, uses user settings if not provided)
 * @returns {Promise<IBlogDoc>}
 */
export const publishToWordPress = async (
  blogId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  wordpressConfig?: { siteUrl: string; username: string; applicationPassword: string }
): Promise<IBlogDoc> => {
  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
  }

  // Get WordPress config from user settings or provided config
  let wpConfig = wordpressConfig;

  if (!wpConfig) {
    const user = await getUserById(userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    if (!user.hasWordPressConfig()) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'WordPress configuration is not set. Please update your profile settings.'
      );
    }

    wpConfig = {
      siteUrl: user.wordpressSiteUrl || '',
      username: user.wordpressUsername || '',
      applicationPassword: user.getDecryptedWordPressPassword(),
    };
  }

  if (!wpConfig.siteUrl || !wpConfig.username || !wpConfig.applicationPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'WordPress configuration is missing');
  }

  wordpressService.initialize(wpConfig);

  try {
    // Update status to pending
    blog.wordpressPublishStatus = 'pending';
    await blog.save();

    // Upload featured image if available
    let featuredMediaId: number | undefined;
    if (blog.selectedImage) {
      try {
        const media = await wordpressService.uploadMedia(blog.selectedImage, blog.title);
        featuredMediaId = media.id;
      } catch (error) {
        // Continue without featured image if upload fails
        logger.info('Failed to upload featured image to WordPress, continuing without it');
      }
    }

    // Get or create category
    const categoryId = await wordpressService.getOrCreateCategory(blog.category);

    // Get or create tags
    const tagIds: number[] = [];
    if (blog.tags && blog.tags.length > 0) {
      for (const tag of blog.tags) {
        try {
          const tagId = await wordpressService.getOrCreateTag(tag);
          tagIds.push(tagId);
        } catch (error) {
          // Continue if tag creation fails
          logger.info(`Failed to create tag ${tag}, continuing without it`);
        }
      }
    }

    // Publish post
    const wpPost = {
      title: blog.title,
      content: blog.content,
      excerpt: blog.seoDescription,
      status: blog.isPublished ? ('publish' as const) : ('draft' as const),
      categories: [categoryId],
      tags: tagIds.length > 0 ? tagIds : undefined,
      featured_media: featuredMediaId,
    };

    let result;
    if (blog.wordpressPostId) {
      // Update existing post
      const updateData: any = { ...wpPost };
      if (updateData.tags === undefined) delete updateData.tags;
      if (updateData.featured_media === undefined) delete updateData.featured_media;
      result = await wordpressService.updatePost(blog.wordpressPostId, updateData);
    } else {
      // Create new post
      const postData: any = { ...wpPost };
      if (postData.tags === undefined) delete postData.tags;
      if (postData.featured_media === undefined) delete postData.featured_media;
      result = await wordpressService.publishPost(postData);
    }

    // Update blog with WordPress info
    blog.wordpressPostId = result.id;
    blog.wordpressPostUrl = result.link;
    blog.wordpressPublishStatus = 'published';
    blog.wordpressPublishedAt = new Date();
    await blog.save();

    return blog;
  } catch (error) {
    // Update status to failed
    blog.wordpressPublishStatus = 'failed';
    await blog.save();

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to publish to WordPress: ${errorMessage}`);
  }
};

/**
 * Publish a blog post to Medium
 * @param {mongoose.Types.ObjectId} blogId - Blog ID
 * @param {mongoose.Types.ObjectId} userId - User ID
 * @param {object} mediumConfig - Medium configuration (optional, uses user settings if not provided)
 * @returns {Promise<IBlogDoc>}
 */
export const publishToMedium = async (
  blogId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  mediumConfig?: { integrationToken: string }
): Promise<IBlogDoc> => {
  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
  }

  // Get Medium config from user settings or provided config
  let mdConfig = mediumConfig;

  if (!mdConfig) {
    const user = await getUserById(userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    if (!user.hasMediumConfig()) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Medium configuration is not set. Please update your profile settings.'
      );
    }

    const userToken = user.getDecryptedMediumToken();
    mdConfig = {
      integrationToken: userToken,
    };
  }

  if (!mdConfig.integrationToken) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Medium integration token is missing');
  }

  try {
    // Update status to pending
    blog.mediumPublishStatus = 'pending';
    await blog.save();

    await mediumService.initialize(mdConfig);

    // Prepare post data
    const mediumPost: any = {
      title: blog.title,
      content: blog.content,
      contentFormat: 'html' as const,
      tags: blog.tags?.slice(0, 5), // Medium allows max 5 tags
      canonicalUrl: blog.wordpressPostUrl, // Use WordPress URL as canonical if available
      publishStatus: blog.isPublished ? ('public' as const) : ('draft' as const),
      license: 'all-rights-reserved' as const,
      notifyFollowers: false,
    };

    // Remove undefined values
    if (mediumPost.tags === undefined) delete mediumPost.tags;
    if (mediumPost.canonicalUrl === undefined) delete mediumPost.canonicalUrl;

    // Publish post
    const result = await mediumService.publishPost(mediumPost);

    // Update blog with Medium info
    blog.mediumPostId = result.id;
    blog.mediumPostUrl = result.url;
    blog.mediumPublishStatus = 'published';
    blog.mediumPublishedAt = new Date();
    await blog.save();

    return blog;
  } catch (error) {
    // Update status to failed
    blog.mediumPublishStatus = 'failed';
    await blog.save();

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to publish to Medium: ${errorMessage}`);
  }
};

/**
 * Get comprehensive analytics overview
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {mongoose.Types.ObjectId} userId - User ID
 * @returns {Promise<any>}
 */
export const getComprehensiveAnalytics = async (
  startDate: string,
  endDate: string,
  userId: mongoose.Types.ObjectId
): Promise<any> => {
  try {
    // Get Google Analytics data
    const [gaOverview, blogPageViews, trafficSources, dailyTrends] = await Promise.all([
      getAnalyticsOverview(startDate, endDate),
      getBlogPageViews(startDate, endDate),
      getTrafficSources(startDate, endDate),
      getDailyTrends(startDate, endDate),
    ]);

    // Get database engagement data
    const engagementStats = await getAllBlogsEngagementStats(userId);

    // Get user's published blogs
    const userBlogs = await Blog.find({ author: userId, isPublished: true })
      .select('slug title category likes dislikes createdAt isFeatured')
      .lean();

    // Match GA views with blog data
    const blogsWithViews = userBlogs.map((blog) => {
      const gaData = blogPageViews.find((bpv) => bpv.slug === blog.slug);
      return {
        id: blog._id?.toString() || '',
        title: blog.title,
        slug: blog.slug,
        category: blog.category || 'Uncategorized',
        publishedAt: blog.createdAt,
        views: gaData?.views || 0,
        likes: blog.likes?.length || 0,
        dislikes: blog.dislikes?.length || 0,
        isFeatured: blog.isFeatured,
        engagementRate: gaData?.views
          ? ((((blog.likes?.length || 0) + (blog.dislikes?.length || 0)) / gaData.views) * 100).toFixed(2)
          : '0.00',
      };
    });

    // Sort by views
    blogsWithViews.sort((a, b) => b.views - a.views);

    // Calculate total blog views from the blogPageViews data
    const totalBlogViews = blogPageViews.reduce((sum, blog) => sum + blog.views, 0);

    return {
      overview: {
        ...gaOverview,
        blogViews: totalBlogViews, // Add blog-specific views
        totalBlogs: engagementStats.totalBlogs,
        totalLikes: engagementStats.totalLikes,
        totalDislikes: engagementStats.totalDislikes,
        totalComments: engagementStats.totalComments,
        totalEngagement: engagementStats.totalEngagement,
        avgEngagementPerBlog: engagementStats.avgEngagementPerBlog,
      },
      blogsPerformance: blogsWithViews,
      trafficSources,
      dailyTrends,
      topPerformers: blogsWithViews.slice(0, 5),
    };
  } catch (error) {
    logger.error('Error fetching comprehensive analytics:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch analytics data');
  }
};

/**
 * Get analytics for a specific time range
 * @param {mongoose.Types.ObjectId} userId - User ID
 * @param {string} timeRange - Time range (7d, 30d, 90d, 1y)
 * @returns {Promise<any>}
 */
export const getAnalyticsByTimeRange = async (
  userId: mongoose.Types.ObjectId,
  timeRange: '7d' | '30d' | '90d' | '1y' = '30d'
): Promise<any> => {
  const endDate = new Date();
  const startDate = new Date();

  switch (timeRange) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(endDate.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
  }

  const startDateStr = startDate.toISOString().split('T')[0] || startDate.toISOString();
  const endDateStr = endDate.toISOString().split('T')[0] || endDate.toISOString();

  return getComprehensiveAnalytics(startDateStr, endDateStr, userId);
};

/**
 * Get event-based analytics (likes, shares, audio plays)
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {mongoose.Types.ObjectId} userId - User ID
 * @returns {Promise<any>}
 */
export const getEventBasedAnalytics = async (
  startDate: string,
  endDate: string,
  userId: mongoose.Types.ObjectId
): Promise<any> => {
  try {
    // Get event data from Google Analytics
    const [likeEvents, shareEvents, audioEvents] = await Promise.all([
      getEventAnalytics(startDate, endDate, 'blog_like'),
      getEventAnalytics(startDate, endDate, 'blog_share'),
      getEventAnalytics(startDate, endDate, 'audio_play'),
    ]);

    // Get user's blogs
    const userBlogs = await Blog.find({ author: userId, isPublished: true }).select('_id slug title').lean();

    const blogMap = new Map(userBlogs.map((b) => [b.slug, b]));

    // Aggregate event counts by blog
    const blogEventCounts = new Map();

    likeEvents.forEach((event: any) => {
      const blog = blogMap.get(event.blogId);
      if (blog) {
        if (!blogEventCounts.has(blog.slug)) {
          blogEventCounts.set(blog.slug, { likes: 0, shares: 0, audioPlays: 0, title: blog.title });
        }
        blogEventCounts.get(blog.slug).likes += event.count;
      }
    });

    shareEvents.forEach((event: any) => {
      const blog = blogMap.get(event.blogId);
      if (blog) {
        if (!blogEventCounts.has(blog.slug)) {
          blogEventCounts.set(blog.slug, { likes: 0, shares: 0, audioPlays: 0, title: blog.title });
        }
        blogEventCounts.get(blog.slug).shares += event.count;
      }
    });

    audioEvents.forEach((event: any) => {
      const blog = blogMap.get(event.blogId);
      if (blog) {
        if (!blogEventCounts.has(blog.slug)) {
          blogEventCounts.set(blog.slug, { likes: 0, shares: 0, audioPlays: 0, title: blog.title });
        }
        blogEventCounts.get(blog.slug).audioPlays += event.count;
      }
    });

    const totalLikes = likeEvents.reduce((sum: number, e: any) => sum + e.count, 0);
    const totalShares = shareEvents.reduce((sum: number, e: any) => sum + e.count, 0);
    const totalAudioPlays = audioEvents.reduce((sum: number, e: any) => sum + e.count, 0);

    return {
      summary: {
        totalLikes,
        totalShares,
        totalAudioPlays,
      },
      byBlog: Array.from(blogEventCounts.entries()).map(([slug, counts]) => ({
        slug,
        ...counts,
      })),
    };
  } catch (error) {
    logger.error('Error fetching event-based analytics:', error);
    // Return empty data if GA events aren't set up yet
    return {
      summary: {
        totalLikes: 0,
        totalShares: 0,
        totalAudioPlays: 0,
      },
      byBlog: [],
    };
  }
};

/**
 * Get dashboard statistics with weekly trends
 * @param {mongoose.Types.ObjectId} userId - User ID
 * @returns {Promise<any>}
 */
export const getDashboardStats = async (userId: mongoose.Types.ObjectId): Promise<any> => {
  try {
    const today = new Date();

    // Current week (last 7 days)
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - 7);
    const currentWeekStartStr = currentWeekStart.toISOString().split('T')[0] || currentWeekStart.toISOString();
    const todayStr = today.toISOString().split('T')[0] || today.toISOString();

    // Previous week (8-14 days ago)
    const previousWeekStart = new Date(today);
    previousWeekStart.setDate(today.getDate() - 14);
    const previousWeekEnd = new Date(today);
    previousWeekEnd.setDate(today.getDate() - 8);
    const previousWeekStartStr = previousWeekStart.toISOString().split('T')[0] || previousWeekStart.toISOString();
    const previousWeekEndStr = previousWeekEnd.toISOString().split('T')[0] || previousWeekEnd.toISOString();

    // Get current and previous week blog analytics using getBlogPageViews
    const [currentWeekBlogViews, previousWeekBlogViews, currentWeekGA, previousWeekGA] = await Promise.all([
      getBlogPageViews(currentWeekStartStr, todayStr),
      getBlogPageViews(previousWeekStartStr, previousWeekEndStr),
      getAnalyticsOverview(currentWeekStartStr, todayStr),
      getAnalyticsOverview(previousWeekStartStr, previousWeekEndStr),
    ]);

    // Sum up blog page views from individual blogs
    const currentWeekBlogPageViews = currentWeekBlogViews.reduce((sum, blog) => sum + blog.views, 0);
    const previousWeekBlogPageViews = previousWeekBlogViews.reduce((sum, blog) => sum + blog.views, 0);

    // Get user data for followers
    const user = await User.findById(userId).select('followers').lean();

    // Get followers count from previous week (we'll approximate based on database)
    // This is a simplified approach - in production you might want to track this in a separate collection
    const currentFollowers = user?.followers?.length || 0;

    // Get user's blogs for calculating average read time and engagement
    const userBlogs = await Blog.find({ author: userId, isPublished: true })
      .select('readingTime likes dislikes views')
      .lean();

    // Calculate average read time from user's blogs
    const avgReadTime =
      userBlogs.length > 0 ? userBlogs.reduce((sum, blog) => sum + (blog.readingTime || 0), 0) / userBlogs.length : 0;

    // Get engagement stats
    const engagementStats = await getAllBlogsEngagementStats(userId);
    const engagementRate = parseFloat(engagementStats.avgEngagementPerBlog) || 0;

    // Calculate total reach (unique users from GA - all site pages)
    const totalReach = currentWeekGA.totalUsers;
    const previousReach = previousWeekGA.totalUsers;

    // Calculate percentage changes for blog views specifically
    const weeklyViewsChange =
      previousWeekBlogPageViews > 0
        ? ((currentWeekBlogPageViews - previousWeekBlogPageViews) / previousWeekBlogPageViews) * 100
        : 0;

    const totalReachChange = previousReach > 0 ? ((totalReach - previousReach) / previousReach) * 100 : 0;

    // For followers, we can estimate by looking at recent change
    // This is simplified - consider implementing a followers history table for accurate tracking
    const newFollowersChange = 0; // Placeholder - would need historical tracking

    // Avg read time change (comparing to site average)
    const avgReadTimeChange =
      currentWeekGA.avgSessionDuration > 0 && avgReadTime > 0
        ? ((avgReadTime - currentWeekGA.avgSessionDuration / 60) / (currentWeekGA.avgSessionDuration / 60)) * 100
        : 0;

    // Engagement rate change
    const previousEngagementRate = previousWeekGA.engagementRate * 100;
    const currentEngagementRate = engagementRate;
    const engagementRateChange =
      previousEngagementRate > 0
        ? ((currentEngagementRate - previousEngagementRate) / previousEngagementRate) * 100
        : 0;

    return {
      weeklyViews: currentWeekBlogPageViews,
      weeklyViewsChange,
      newFollowers: currentFollowers, // Current total followers
      newFollowersChange, // Would need historical data
      avgReadTime: Math.round(avgReadTime * 10) / 10, // Round to 1 decimal
      avgReadTimeChange,
      engagementRate: Math.round(engagementRate * 10) / 10,
      engagementRateChange,
      totalReach,
      totalReachChange,
    };
  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch dashboard statistics');
  }
};
