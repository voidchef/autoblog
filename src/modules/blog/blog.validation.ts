import Joi from 'joi';
import { objectId } from '../validate/custom.validation';
import { IGenerateBlog, NewCreatedBlog } from './blog.interfaces';

export const generateBlog: Record<keyof IGenerateBlog, any> = {
  topic: Joi.string().required(),
  country: Joi.string().optional(),
  intent: Joi.string().optional(),
  audience: Joi.string().optional(),
  language: Joi.string().required(),
  llmModel: Joi.string().required(),
  llmProvider: Joi.string().valid('openai', 'google', 'mistral').optional(),
  category: Joi.string().required(),
  tags: Joi.array().optional(),
};

export const generateBlogFromTemplate = {
  body: Joi.object().keys({
    input: Joi.string().required(), // JSON string of template variables
    llmModel: Joi.string().required(),
    llmProvider: Joi.string().valid('openai', 'google', 'mistral').optional(),
    category: Joi.string().required(),
    tags: Joi.string().optional(), // JSON string of tags array
    generateImages: Joi.string().valid('true', 'false').optional(),
    generateHeadingImages: Joi.string().valid('true', 'false').optional(),
    imagesPerSection: Joi.string().optional(),
  }),
};

const createBlogBody: Partial<Record<keyof NewCreatedBlog, any>> = {
  ...generateBlog,
  title: Joi.string().required(),
  slug: Joi.string().required(),
  seoTitle: Joi.string().required(),
  seoDescription: Joi.string().required(),
  author: Joi.custom(objectId).required(),
  content: Joi.string().required(),
  category: Joi.string().required(),
  tags: Joi.array().optional(),
  generatedImages: Joi.array().items(Joi.string()).optional(),
  selectedImage: Joi.string().optional(),
  audioNarrationUrl: Joi.string().optional(),
  audioGenerationStatus: Joi.string().valid('pending', 'processing', 'completed', 'failed').optional(),
  wordpressPostId: Joi.number().optional(),
  wordpressPostUrl: Joi.string().optional(),
  wordpressPublishStatus: Joi.string().valid('pending', 'published', 'failed').optional(),
  wordpressPublishedAt: Joi.date().optional(),
  mediumPostId: Joi.string().optional(),
  mediumPostUrl: Joi.string().optional(),
  mediumPublishStatus: Joi.string().valid('pending', 'published', 'failed').optional(),
  mediumPublishedAt: Joi.date().optional(),
};

export const createBlog = {
  body: Joi.object().keys(createBlogBody),
};

export const getBlogs = {
  query: Joi.object().keys({
    author: Joi.custom(objectId),
    category: Joi.string(),
    tags: Joi.array(),
    isFeatured: Joi.boolean(),
    isPublished: Joi.boolean(),
    isDraft: Joi.boolean(),
    views: Joi.boolean(),
    sortBy: Joi.string(),
    projectBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    populate: Joi.string(),
  }),
};

export const getBlog = {
  params: Joi.object().keys({
    blogId: Joi.string(),
  }),
};

export const getViews = {
  query: Joi.object().keys({
    startDate: Joi.string().required(),
    endDate: Joi.string().required(),
    slug: Joi.string().required(),
  }),
};

export const updateBlog = {
  params: Joi.object().keys({
    blogId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string(),
      content: Joi.string(),
      category: Joi.string(),
      tags: Joi.array(),
      selectedImage: Joi.string(),
      isFeatured: Joi.boolean(),
      isPublished: Joi.boolean(),
      isDraft: Joi.boolean(),
    })
    .min(1),
};

export const deleteBlog = {
  params: Joi.object().keys({
    blogId: Joi.string().custom(objectId),
  }),
};

export const bulkDeleteBlogs = {
  body: Joi.object().keys({
    blogIds: Joi.array().items(Joi.string().custom(objectId)).required(),
  }),
};

export const getBlogEngagementStats = {
  params: Joi.object().keys({
    slug: Joi.string().required(),
  }),
};

export const getAllBlogsEngagementStats = {
  // No params needed - uses authenticated user
};

export const getComprehensiveAnalytics = {
  query: Joi.object().keys({
    startDate: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .required(),
    endDate: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .required(),
  }),
};

export const getAnalyticsByTimeRange = {
  query: Joi.object().keys({
    timeRange: Joi.string().valid('7d', '30d', '90d', '1y').default('30d'),
  }),
};

export const getEventBasedAnalytics = {
  query: Joi.object().keys({
    startDate: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .required(),
    endDate: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .required(),
  }),
};
