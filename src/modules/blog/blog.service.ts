import httpStatus from 'http-status';
import mongoose from 'mongoose';
import config from '../../config/config';
import S3Utils from '../aws/s3utils';
import ApiError from '../errors/ApiError';
import logger from '../logger/logger';
import { mediumService } from '../medium';
import { IOptions, QueryResult } from '../paginate/paginate';
import { PostGenerator, Post, AutoPostPrompt } from '../postGen';
import { ttsService } from '../tts';
import { getUserById } from '../user/user.service';
import runReport, { IRunReportResponse } from '../utils/analytics';
import { wordpressService } from '../wordpress';
import { IGenerateBlog, NewCreatedBlog, UpdateBlogBody, IBlogDoc } from './blog.interfaces';
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
  return blog;
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
  // Get the user to retrieve the decrypted OpenAI key
  const user = await getUserById(author);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!user.hasOpenAiKey()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OpenAI API key is required for blog generation');
  }

  const decryptedApiKey = user.getDecryptedOpenAiKey();
  if (!decryptedApiKey) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to decrypt OpenAI API key');
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
  return createBlog({ ...post, ...generateBlogData, ...additionalData } as NewCreatedBlog);
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
 * Get blog by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<IBlogDoc | null>}
 */
export const getBlogById = async (id: mongoose.Types.ObjectId): Promise<IBlogDoc | null> =>
  Blog.findById(id).populate('author');

/**
 * Get blog by slug
 * @param {mongoose.Types.ObjectId} slug
 * @returns {Promise<IBlogDoc | null>}
 */
export const getBlogBySlug = async (slug: string): Promise<IBlogDoc | null> =>
  Blog.findOne({ slug }).populate('author');

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
  const blog = await getBlogById(blogId);
  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
  }
  Object.assign(blog, updateBody);
  await blog.save();
  return blog;
};

/**
 * Delete blog by id
 * @param {mongoose.Types.ObjectId} blogId
 * @returns {Promise<IBlogDoc | null>}
 */
export const deleteBlogById = async (blogId: mongoose.Types.ObjectId): Promise<IBlogDoc | null> => {
  const blog = await getBlogById(blogId);
  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
  }
  await blog.deleteOne();
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
  const blog = await getBlogById(blogId);
  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
  }
  await blog.toggleLike(userId);
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
  const blog = await getBlogById(blogId);
  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
  }
  await blog.toggleDislike(userId);
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
 * Generate audio narration for a blog post
 * @param {mongoose.Types.ObjectId} blogId - Blog ID
 * @returns {Promise<IBlogDoc>}
 */
export const generateAudioNarration = async (blogId: mongoose.Types.ObjectId): Promise<IBlogDoc> => {
  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
  }

  // Check if audio is already being generated
  if (blog.audioGenerationStatus === 'processing') {
    throw new ApiError(httpStatus.CONFLICT, 'Audio narration is already being generated');
  }

  // Update status to processing
  blog.audioGenerationStatus = 'processing';
  await blog.save();

  try {
    // Generate audio using TTS service
    const result = await ttsService.textToSpeech(blog.content, blog.id, {
      languageCode: blog.language === 'en' ? 'en-US' : blog.language,
    });

    // Update blog with audio URL
    blog.audioNarrationUrl = result.audioUrl;
    blog.audioGenerationStatus = 'completed';
    await blog.save();

    return blog;
  } catch (error) {
    // Update status to failed
    blog.audioGenerationStatus = 'failed';
    await blog.save();

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to generate audio narration: ${errorMessage}`);
  }
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
