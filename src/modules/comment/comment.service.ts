import httpStatus from 'http-status';
import mongoose from 'mongoose';
import { cacheService } from '../cache';
import ApiError from '../errors/ApiError';
import { IOptions, QueryResult } from '../paginate/paginate';
import { NewComment, UpdateCommentBody, ICommentDoc } from './comment.interfaces';
import Comment from './comment.model';

/**
 * Create a comment
 * @param {NewComment} commentBody
 * @returns {Promise<ICommentDoc>}
 */
export const createComment = async (commentBody: NewComment): Promise<ICommentDoc> => {
  const comment = await Comment.create(commentBody);

  // Invalidate cache for comments of this blog
  if (commentBody.blog) {
    await cacheService.delPattern(`comment:blog:${commentBody.blog.toString()}:*`);
  }
  // Invalidate parent comment replies cache if it's a reply
  if (commentBody.parentComment) {
    await cacheService.delPattern(`comment:replies:${commentBody.parentComment.toString()}:*`);
  }

  return comment;
};

/**
 * Query for comments
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
export const queryComments = async (filter: Record<string, any>, options: IOptions): Promise<QueryResult> => {
  // By default, exclude deleted comments
  const finalFilter = { ...filter, isDeleted: false };
  const comments = await Comment.paginate(finalFilter, options);
  // Populate author with only the name
  if (comments.results) {
    await Promise.all(
      comments.results.map(async (comment: any) => {
        await comment.populate('author', 'name');
      })
    );
  }
  return comments;
};

/**
 * Get comment by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<ICommentDoc | null>}
 */
export const getCommentById = async (id: mongoose.Types.ObjectId): Promise<ICommentDoc | null> => {
  const cacheKey = `comment:id:${id.toString()}`;

  // Try to get from cache
  const cached = await cacheService.get<ICommentDoc>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from database
  const comment = await Comment.findOne({ _id: id, isDeleted: false }).populate('author', 'name email');

  // Cache the result (10 minutes TTL for comments)
  if (comment) {
    await cacheService.set(cacheKey, comment, 600);
  }

  return comment;
};

/**
 * Update comment by id
 * @param {mongoose.Types.ObjectId} commentId
 * @param {UpdateCommentBody} updateBody
 * @returns {Promise<ICommentDoc | null>}
 */
export const updateCommentById = async (
  commentId: mongoose.Types.ObjectId,
  updateBody: UpdateCommentBody
): Promise<ICommentDoc | null> => {
  // Fetch directly from DB to avoid cached document issues when saving
  const comment = await Comment.findOne({ _id: commentId, isDeleted: false });
  if (!comment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Comment not found');
  }
  Object.assign(comment, updateBody);
  await comment.save();

  // Invalidate cache for this comment
  await cacheService.del(`comment:id:${commentId.toString()}`);
  // Invalidate cache for blog comments
  if (comment.blog) {
    await cacheService.delPattern(`comment:blog:${comment.blog.toString()}:*`);
  }

  return comment;
};

/**
 * Delete comment by id (soft delete)
 * @param {mongoose.Types.ObjectId} commentId
 * @returns {Promise<ICommentDoc | null>}
 */
export const deleteCommentById = async (commentId: mongoose.Types.ObjectId): Promise<ICommentDoc | null> => {
  // Fetch directly from DB to avoid cached document issues when saving
  const comment = await Comment.findOne({ _id: commentId, isDeleted: false });
  if (!comment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Comment not found');
  }
  comment.isDeleted = true;
  await comment.save();

  // Invalidate cache for this comment
  await cacheService.del(`comment:id:${commentId.toString()}`);
  // Invalidate cache for blog comments
  if (comment.blog) {
    await cacheService.delPattern(`comment:blog:${comment.blog.toString()}:*`);
  }

  return comment;
};

/**
 * Like a comment
 * @param {mongoose.Types.ObjectId} commentId
 * @param {mongoose.Types.ObjectId} userId
 * @returns {Promise<ICommentDoc | null>}
 */
export const likeComment = async (
  commentId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId
): Promise<ICommentDoc | null> => {
  // Fetch directly from DB to use instance methods
  const comment = await Comment.findOne({ _id: commentId, isDeleted: false });
  if (!comment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Comment not found');
  }
  await comment.toggleLike(userId);
  // Invalidate cache
  await cacheService.del(`comment:id:${commentId.toString()}`);
  return comment;
};

/**
 * Dislike a comment
 * @param {mongoose.Types.ObjectId} commentId
 * @param {mongoose.Types.ObjectId} userId
 * @returns {Promise<ICommentDoc | null>}
 */
export const dislikeComment = async (
  commentId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId
): Promise<ICommentDoc | null> => {
  // Fetch directly from DB to use instance methods
  const comment = await Comment.findOne({ _id: commentId, isDeleted: false });
  if (!comment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Comment not found');
  }
  await comment.toggleDislike(userId);
  // Invalidate cache
  await cacheService.del(`comment:id:${commentId.toString()}`);
  return comment;
};

/**
 * Get comments by blog id with nested replies
 * @param {mongoose.Types.ObjectId} blogId
 * @param {IOptions} options
 * @returns {Promise<QueryResult>}
 */
export const getCommentsByBlogId = async (blogId: mongoose.Types.ObjectId, options: IOptions): Promise<QueryResult> => {
  const filter = { blog: blogId, parentComment: null };
  return queryComments(filter, options);
};

/**
 * Get replies to a comment
 * @param {mongoose.Types.ObjectId} commentId
 * @param {IOptions} options
 * @returns {Promise<QueryResult>}
 */
export const getRepliesByCommentId = async (
  commentId: mongoose.Types.ObjectId,
  options: IOptions
): Promise<QueryResult> => {
  const filter = { parentComment: commentId };
  return queryComments(filter, options);
};
