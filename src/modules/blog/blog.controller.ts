import { Request, Response } from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import ApiError from '../errors/ApiError';
import { IOptions } from '../paginate/paginate';
import { IUserDoc } from '../user/user.interfaces';
import catchAsync from '../utils/catchAsync';
import pick from '../utils/pick';
import { IBlogDoc } from './blog.interfaces';
import * as blogService from './blog.service';
import { cleanupTemplateFile } from './template-upload.middleware';
import { validateTemplateFile, getTemplatePreview } from './template.utils';

export const generateBlog = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserDoc;
  const blog = await blogService.initiateBlogGeneration(req.body, user._id as mongoose.Types.ObjectId);
  res.status(httpStatus.ACCEPTED).send(blog);
});

export const generateBlogFromTemplate = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserDoc;

  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Template file is required');
  }

  const templateFile = req.file.path;

  try {
    // Validate the template file
    await validateTemplateFile(templateFile);

    // Parse template parameters from request body with error handling
    let input = {};
    let tags;

    try {
      input = JSON.parse(req.body.input || '{}');
    } catch {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid JSON in input field');
    }

    if (req.body.tags) {
      try {
        tags = JSON.parse(req.body.tags);
      } catch {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid JSON in tags field');
      }
    }

    const templateData = {
      templateFile,
      input,
      llmModel: req.body.llmModel,
      llmProvider: req.body.llmProvider,
      category: req.body.category,
      tags,
      generateImages: req.body.generateImages === 'true',
      generateHeadingImages: req.body.generateHeadingImages === 'true',
      imagesPerSection: req.body.imagesPerSection ? parseInt(req.body.imagesPerSection, 10) : 2,
    };

    const blog = await blogService.initiateBlogGenerationFromTemplate(
      templateData,
      user._id as mongoose.Types.ObjectId
    );

    // Note: Template file cleanup will happen after generation completes

    res.status(httpStatus.ACCEPTED).send(blog);
  } catch (error) {
    // Clean up the template file in case of error
    cleanupTemplateFile(templateFile);
    throw error;
  }
});

export const getTemplatePreviewFromFile = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Template file is required');
  }

  const templateFile = req.file.path;

  try {
    // Validate and get preview of the template
    await validateTemplateFile(templateFile);
    const preview = await getTemplatePreview(templateFile);

    // Clean up the template file after preview
    cleanupTemplateFile(templateFile);

    res.status(httpStatus.OK).send(preview);
  } catch (error) {
    // Clean up the template file in case of error
    cleanupTemplateFile(templateFile);
    throw error;
  }
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

  // Always populate author field with id and name if not already specified
  if (!options.populate) {
    options.populate = 'author';
  } else if (!options.populate.includes('author')) {
    options.populate += ',author';
  }

  const result = await blogService.queryBlogs(filter, options);
  result.results.forEach((blog: any) => {
    blog.excerpt = blog.generateExcerpt(160);
    delete blog.content;
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

  const deletePromises = blogIds.map((id: string) => blogService.deleteBlogById(new mongoose.Types.ObjectId(id)));

  await Promise.all(deletePromises);
  res.status(httpStatus.NO_CONTENT).send();
});

export const searchBlogs = catchAsync(async (req: Request, res: Response) => {
  const { query: searchQuery, ...filterOptions } = req.query;
  const filter: any = pick(req.query, ['author', 'category', 'tags', 'isFeatured', 'isPublished', 'isDraft']);
  const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy', 'populate']);

  // Always populate author field with id and name if not already specified
  if (!options.populate) {
    options.populate = 'author';
  } else if (!options.populate.includes('author')) {
    options.populate += ',author';
  }

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
      user._id as mongoose.Types.ObjectId
    );
    res.send(blog);
  }
});

export const dislikeBlog = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserDoc;
  if (typeof req.params['blogId'] === 'string') {
    const blog = await blogService.dislikeBlog(
      new mongoose.Types.ObjectId(req.params['blogId']),
      user._id as mongoose.Types.ObjectId
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

export const generateAudioNarration = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['blogId'] === 'string') {
    const blog = await blogService.generateAudioNarration(new mongoose.Types.ObjectId(req.params['blogId']));
    res.status(httpStatus.OK).send({
      message: 'Audio narration generated successfully',
      audioNarrationUrl: blog.audioNarrationUrl,
      audioGenerationStatus: blog.audioGenerationStatus,
    });
  }
});

export const getAudioNarrationStatus = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['blogId'] === 'string') {
    const status = await blogService.getAudioNarrationStatus(new mongoose.Types.ObjectId(req.params['blogId']));
    res.send(status);
  }
});

export const getBlogGenerationStatus = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['blogId'] === 'string') {
    const blog = await blogService.getBlogById(new mongoose.Types.ObjectId(req.params['blogId']));
    if (!blog) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
    }
    res.send({
      id: blog.id,
      generationStatus: blog.generationStatus || 'completed',
      generationError: blog.generationError,
      title: blog.title,
      slug: blog.slug,
    });
  }
});

export const publishToWordPress = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserDoc;
  if (typeof req.params['blogId'] === 'string') {
    const blog = await blogService.publishToWordPress(
      new mongoose.Types.ObjectId(req.params['blogId']),
      user._id as mongoose.Types.ObjectId,
      req.body.wordpressConfig
    );
    res.send(blog);
  }
});

export const publishToMedium = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserDoc;
  if (typeof req.params['blogId'] === 'string') {
    const blog = await blogService.publishToMedium(
      new mongoose.Types.ObjectId(req.params['blogId']),
      user._id as mongoose.Types.ObjectId,
      req.body.mediumConfig
    );
    res.send(blog);
  }
});

/**
 * Get comprehensive analytics overview
 */
export const getComprehensiveAnalytics = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserDoc;
  const { startDate, endDate } = req.query;

  const analytics = await blogService.getComprehensiveAnalytics(
    startDate as string,
    endDate as string,
    user._id as mongoose.Types.ObjectId
  );

  res.send(analytics);
});

/**
 * Get analytics by time range
 */
export const getAnalyticsByTimeRange = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserDoc;
  const { timeRange } = req.query;

  const analytics = await blogService.getAnalyticsByTimeRange(
    user._id as mongoose.Types.ObjectId,
    timeRange as '7d' | '30d' | '90d' | '1y'
  );

  res.send(analytics);
});

/**
 * Get event-based analytics
 */
export const getEventBasedAnalytics = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserDoc;
  const { startDate, endDate } = req.query;

  const analytics = await blogService.getEventBasedAnalytics(
    startDate as string,
    endDate as string,
    user._id as mongoose.Types.ObjectId
  );

  res.send(analytics);
});
