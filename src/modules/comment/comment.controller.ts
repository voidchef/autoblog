import { Request, Response } from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import ApiError from '../errors/ApiError';
import { IOptions } from '../paginate/paginate';
import { IUserDoc } from '../user/user.interfaces';
import catchAsync from '../utils/catchAsync';
import pick from '../utils/pick';
import * as commentService from './comment.service';

export const createComment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserDoc;
  const commentData = { ...req.body, author: user._id };
  const comment = await commentService.createComment(commentData);
  res.status(httpStatus.CREATED).send(comment);
});

export const getComments = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ['blog', 'author', 'parentComment']);
  const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
  const result = await commentService.queryComments(filter, options);
  res.send(result);
});

export const getCommentsByBlog = catchAsync(async (req: Request, res: Response) => {
  const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
  const blogId = new mongoose.Types.ObjectId(req.params['blogId']);
  const result = await commentService.getCommentsByBlogId(blogId, options);
  res.send(result);
});

export const getComment = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['commentId'] === 'string') {
    const comment = await commentService.getCommentById(new mongoose.Types.ObjectId(req.params['commentId']));
    if (!comment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Comment not found');
    }
    res.send(comment);
  }
});

export const getReplies = catchAsync(async (req: Request, res: Response) => {
  const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
  const commentId = new mongoose.Types.ObjectId(req.params['commentId']);
  const result = await commentService.getRepliesByCommentId(commentId, options);
  res.send(result);
});

export const updateComment = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['commentId'] === 'string') {
    const comment = await commentService.updateCommentById(
      new mongoose.Types.ObjectId(req.params['commentId']),
      req.body
    );
    res.send(comment);
  }
});

export const deleteComment = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['commentId'] === 'string') {
    await commentService.deleteCommentById(new mongoose.Types.ObjectId(req.params['commentId']));
    res.status(httpStatus.NO_CONTENT).send();
  }
});

export const likeComment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserDoc;
  if (typeof req.params['commentId'] === 'string') {
    const comment = await commentService.likeComment(
      new mongoose.Types.ObjectId(req.params['commentId']),
      user._id as mongoose.Types.ObjectId
    );
    res.send(comment);
  }
});

export const dislikeComment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserDoc;
  if (typeof req.params['commentId'] === 'string') {
    const comment = await commentService.dislikeComment(
      new mongoose.Types.ObjectId(req.params['commentId']),
      user._id as mongoose.Types.ObjectId
    );
    res.send(comment);
  }
});
