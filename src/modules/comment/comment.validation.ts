import Joi from 'joi';
import { objectId } from '../validate/custom.validation';

const createComment = {
  body: Joi.object().keys({
    content: Joi.string().required().min(1).max(5000),
    blog: Joi.string().custom(objectId).required(),
    parentComment: Joi.string().custom(objectId).optional(),
  }),
};

const getComments = {
  query: Joi.object().keys({
    blog: Joi.string().custom(objectId),
    author: Joi.string().custom(objectId),
    parentComment: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    projectBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    populate: Joi.string(),
  }),
};

const getCommentsByBlog = {
  params: Joi.object().keys({
    blogId: Joi.string().custom(objectId).required(),
  }),
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    populate: Joi.string(),
  }),
};

const getComment = {
  params: Joi.object().keys({
    commentId: Joi.string().custom(objectId).required(),
  }),
};

const getReplies = {
  params: Joi.object().keys({
    commentId: Joi.string().custom(objectId).required(),
  }),
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    populate: Joi.string(),
  }),
};

const updateComment = {
  params: Joi.object().keys({
    commentId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      content: Joi.string().min(1).max(5000),
    })
    .min(1),
};

const deleteComment = {
  params: Joi.object().keys({
    commentId: Joi.string().custom(objectId).required(),
  }),
};

const likeComment = {
  params: Joi.object().keys({
    commentId: Joi.string().custom(objectId).required(),
  }),
};

const dislikeComment = {
  params: Joi.object().keys({
    commentId: Joi.string().custom(objectId).required(),
  }),
};

export default {
  createComment,
  getComments,
  getCommentsByBlog,
  getComment,
  getReplies,
  updateComment,
  deleteComment,
  likeComment,
  dislikeComment,
};
