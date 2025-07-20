import httpStatus from 'http-status';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import catchAsync from '../utils/catchAsync';
import ApiError from '../errors/ApiError';
import pick from '../utils/pick';
import { IOptions } from '../paginate/paginate';
import * as blogService from './blog.service';
import { IBlogDoc } from './blog.interfaces';
import { IUserDoc } from '../user/user.interfaces';

export const generateBlog = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserDoc;
  const blog = await blogService.generateBlog(req.body, user._id as mongoose.Types.ObjectId);
  res.status(httpStatus.CREATED).send(blog);
});

export const createBlog = catchAsync(async (req: Request, res: Response) => {
  const blog = await blogService.createBlog(req.body);
  res.status(httpStatus.CREATED).send(blog);
});

export const getBlogs = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ['author', 'category', 'tags', 'isFeatured', 'isPublished', 'isDraft', 'views']);
  const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy', 'populate']);
  const result = await blogService.queryBlogs(filter, options);
  result.results.forEach((blog: any) => {
    // eslint-disable-next-line no-param-reassign
    blog.content = blog.content.split(' ').slice(0, 40).join(' ');
  });
  res.send(result);
});

export const getBlog = catchAsync(async (req: Request, res: Response) => {
  let blog: IBlogDoc | null = null;
  if (mongoose.isValidObjectId(req.params['blogId'])) {
    blog = await blogService.getBlogById(new mongoose.Types.ObjectId(req.params['blogId']));
  } else if (typeof req.params['blogId'] === 'string') {
    blog = await blogService.getBlogBySlug(req.params['blogId']);
  }
  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
  }
  res.send(blog);
});

export const getViews = catchAsync(async (req: Request, res: Response) => {
  const { slug, startDate, endDate } = req.query;
  const views = await blogService.getBlogViews(startDate as string, endDate as string, slug as string);
  res.send(views);
});

export const updateBlog = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['blogId'] === 'string') {
    const blog = await blogService.updateBlogById(new mongoose.Types.ObjectId(req.params['blogId']), req.body);
    res.send(blog);
  }
});

export const deleteBlog = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['blogId'] === 'string') {
    await blogService.deleteBlogById(new mongoose.Types.ObjectId(req.params['blogId']));
    res.status(httpStatus.NO_CONTENT).send();
  }
});
