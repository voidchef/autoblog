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
  const user = req.user as IUserDoc;
  const blogData = { ...req.body, author: user._id };
  const blog = await blogService.createBlog(blogData);
  res.status(httpStatus.CREATED).send(blog);
});

export const getBlogs = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ['author', 'category', 'tags', 'isFeatured', 'isPublished', 'isDraft', 'views']);
  const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy', 'populate']);
  const result = await blogService.queryBlogs(filter, options);
  result.results.forEach((blog: any) => {
    blog.excerpt = blog.generateExcerpt ? blog.generateExcerpt(160) : blog.content.split(' ').slice(0, 40).join(' ') + '...';
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

export const publishBlog = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['blogId'] === 'string') {
    const blog = await blogService.updateBlogById(new mongoose.Types.ObjectId(req.params['blogId']), {
      isPublished: true,
      isDraft: false,
    });
    res.send(blog);
  }
});

export const unpublishBlog = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['blogId'] === 'string') {
    const blog = await blogService.updateBlogById(new mongoose.Types.ObjectId(req.params['blogId']), {
      isPublished: false,
      isDraft: true,
    });
    res.send(blog);
  }
});

export const toggleFeatured = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['blogId'] === 'string') {
    const currentBlog = await blogService.getBlogById(new mongoose.Types.ObjectId(req.params['blogId']));
    if (!currentBlog) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
    }
    const blog = await blogService.updateBlogById(new mongoose.Types.ObjectId(req.params['blogId']), {
      isFeatured: !currentBlog.isFeatured,
    });
    res.send(blog);
  }
});

export const bulkDeleteBlogs = catchAsync(async (req: Request, res: Response) => {
  const { blogIds } = req.body;
  if (!Array.isArray(blogIds)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'blogIds must be an array');
  }
  
  const deletePromises = blogIds.map((id: string) => 
    blogService.deleteBlogById(new mongoose.Types.ObjectId(id))
  );
  
  await Promise.all(deletePromises);
  res.status(httpStatus.NO_CONTENT).send();
});

export const searchBlogs = catchAsync(async (req: Request, res: Response) => {
  const { query: searchQuery, ...filterOptions } = req.query;
  const filter: any = pick(req.query, ['author', 'category', 'tags', 'isFeatured', 'isPublished', 'isDraft']);
  const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy', 'populate']);
  
  // Add search functionality to filter if query is provided
  if (searchQuery && typeof searchQuery === 'string') {
    filter.$or = [
      { title: { $regex: searchQuery, $options: 'i' } },
      { content: { $regex: searchQuery, $options: 'i' } },
      { seoDescription: { $regex: searchQuery, $options: 'i' } },
    ];
  }
  
  const result = await blogService.queryBlogs(filter, options);
  result.results.forEach((blog: any) => {
    // eslint-disable-next-line no-param-reassign
    blog.content = blog.content.split(' ').slice(0, 40).join(' ');
  });
  res.send(result);
});

export const generateSitemap = catchAsync(async (req: Request, res: Response) => {
  const { generateSitemapXML } = await import('./sitemap.service');
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const sitemapXML = await generateSitemapXML(baseUrl);
  
  res.set('Content-Type', 'application/xml');
  res.send(sitemapXML);
});

export const generateRobots = catchAsync(async (req: Request, res: Response) => {
  const { generateRobotsTxt } = await import('./sitemap.service');
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const robotsTxt = generateRobotsTxt(baseUrl);
  
  res.set('Content-Type', 'text/plain');
  res.send(robotsTxt);
});

export const likeBlog = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserDoc;
  if (typeof req.params['blogId'] === 'string') {
    const blog = await blogService.likeBlog(
      new mongoose.Types.ObjectId(req.params['blogId']),
      user._id as mongoose.Types.ObjectId,
    );
    res.send(blog);
  }
});

export const dislikeBlog = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserDoc;
  if (typeof req.params['blogId'] === 'string') {
    const blog = await blogService.dislikeBlog(
      new mongoose.Types.ObjectId(req.params['blogId']),
      user._id as mongoose.Types.ObjectId,
    );
    res.send(blog);
  }
});

export const getBlogEngagementStats = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['slug'] === 'string') {
    const stats = await blogService.getBlogEngagementStats(req.params['slug']);
    res.send(stats);
  }
});

export const getAllBlogsEngagementStats = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserDoc;
  const stats = await blogService.getAllBlogsEngagementStats(user._id as mongoose.Types.ObjectId);
  res.send(stats);
});

