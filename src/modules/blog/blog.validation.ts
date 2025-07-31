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
  category: Joi.string().required(),
  tags: Joi.array().optional(),
};

const createBlogBody: Record<keyof NewCreatedBlog, any> = {
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
