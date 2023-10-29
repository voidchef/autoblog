import httpStatus from 'http-status';
import mongoose from 'mongoose';
import Blog from './blog.model';
import ApiError from '../errors/ApiError';
import { IOptions, QueryResult } from '../paginate/paginate';
import { IGenerateBlog, NewCreatedBlog, UpdateBlogBody, IBlogDoc } from './blog.interfaces';
import { OpenAIPostGenerator, Post } from '../postGen';
import { imgGen } from '../imgGen';
import { uploadFilesToBucket } from '../aws';

/**
 * Create a blog post
 * @param {NewCreatedBlog} blogBody
 * @returns {Promise<IBlogDoc>}
 */
export const createBlog = async (blogBody: NewCreatedBlog): Promise<IBlogDoc> => {
  const blog = await Blog.create(blogBody);
  await uploadFilesToBucket('autoblogbucket', './src/modules/imgGen/images/', `blogs/${blog._id}`);
  return blog;
};

/**
 * Generate a blog post
 * @param {IGenerateBlog} generateBlogData
 * @param {mongoose.Types.ObjectId} author
 * @returns {Promise<IBlogDoc>}
 */
export const generateBlog = async (generateBlogData: IGenerateBlog, author: mongoose.Types.ObjectId): Promise<IBlogDoc> => {
  const { category, tags, ...prompt } = generateBlogData;
  const postGenerator = new OpenAIPostGenerator(prompt);
  const post: Post = await postGenerator.generate();
  await imgGen(prompt.topic);
  const additionalData: { category: string; author: mongoose.Types.ObjectId; tags?: string[] } = { category, author };
  if (tags) {
    additionalData.tags = tags!.split(/\s*,\s*/).map((tag: string) => tag.trim());
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
