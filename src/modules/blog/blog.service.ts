import httpStatus from 'http-status';
import mongoose from 'mongoose';
import Blog from './blog.model';
import ApiError from '../errors/ApiError';
import { IOptions, QueryResult } from '../paginate/paginate';
import { IGenerateBlog, NewCreatedBlog, UpdateBlogBody, IBlogDoc } from './blog.interfaces';
import { PostGenerator, Post, AutoPostPrompt } from '../postGen';
import runReport, { IRunReportResponse } from '../utils/analytics';
import S3Utils from '../aws/s3utils';
import { getUserById } from '../user/user.service';

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
export const generateBlog = async (generateBlogData: IGenerateBlog, author: mongoose.Types.ObjectId): Promise<IBlogDoc> => {
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
export const getBlogBySlug = async (slug: string): Promise<IBlogDoc | null> => Blog.findOne({ slug }).populate('author');

/**
 * Update blog by id
 * @param {mongoose.Types.ObjectId} blogId
 * @param {UpdateBlogBody} updateBody
 * @returns {Promise<IBlogDoc | null>}
 */
export const updateBlogById = async (
  blogId: mongoose.Types.ObjectId,
  updateBody: UpdateBlogBody,
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
export const getBlogViews = async (startDate: string, endDate: string, slug: string): Promise<IRunReportResponse | null> => {
  const views = await runReport(startDate, endDate, slug);
  if (!views) {
    throw new Error('Error getting views');
  }
  return views;
};
