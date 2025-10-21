import express, { Router } from 'express';
import { validate } from '../../modules/validate';
import { auth } from '../../modules/auth';
import { blogController, blogValidation } from '../../modules/blog';

const router: Router = express.Router();

router
  .route('/')
  .post(auth('generateBlogs'), validate(blogValidation.generateBlog), blogController.generateBlog)
  .get(validate(blogValidation.getBlogs), blogController.getBlogs);

router.route('/create').post(auth('manageBlogs'), validate(blogValidation.createBlog), blogController.createBlog);
router
  .route('/bulk-delete')
  .delete(auth('manageBlogs'), validate(blogValidation.bulkDeleteBlogs), blogController.bulkDeleteBlogs);
router.route('/search').get(validate(blogValidation.getBlogs), blogController.searchBlogs);
router.route('/sitemap.xml').get(blogController.generateSitemap);
router.route('/robots.txt').get(blogController.generateRobots);

router.route('/views').get(auth('getViews'), validate(blogValidation.getViews), blogController.getViews);

router
  .route('/my-engagement-stats')
  .get(auth(), validate(blogValidation.getAllBlogsEngagementStats), blogController.getAllBlogsEngagementStats);

router
  .route('/:slug/engagement-stats')
  .get(validate(blogValidation.getBlogEngagementStats), blogController.getBlogEngagementStats);

router
  .route('/:blogId')
  .get(validate(blogValidation.getBlog), blogController.getBlog)
  .patch(auth('manageBlogs'), validate(blogValidation.updateBlog), blogController.updateBlog)
  .delete(auth('manageBlogs'), validate(blogValidation.deleteBlog), blogController.deleteBlog);

// Additional convenience routes for publishing and toggling featured
router.route('/:blogId/publish').patch(auth('manageBlogs'), blogController.publishBlog);
router.route('/:blogId/unpublish').patch(auth('manageBlogs'), blogController.unpublishBlog);
router.route('/:blogId/toggle-featured').patch(auth('manageBlogs'), blogController.toggleFeatured);

// Like and dislike routes
router.route('/:blogId/like').post(auth(), blogController.likeBlog);
router.route('/:blogId/dislike').post(auth(), blogController.dislikeBlog);

export default router;

/**
 * @swagger
 * tags:
 *   name: Blogs
 *   description: Blog management and generation
 */

/**
 * @swagger
 * /blogs:
 *   post:
 *     summary: Generate a new blog post
 *     description: Generate a new blog post using AI based on provided parameters. Only authenticated users with generateBlogs permission can access this.
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GenerateBlogRequest'
 *     responses:
 *       "201":
 *         description: Blog post generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all blog posts
 *     description: Retrieve all blog posts with optional filtering, sorting, and pagination.
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Filter by blog title
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter by author ID
 *       - in: query
 *         name: isPublished
 *         schema:
 *           type: boolean
 *         description: Filter by published status
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *         description: Filter by featured status
 *       - in: query
 *         name: isDraft
 *         schema:
 *           type: boolean
 *         description: Filter by draft status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort by query in the form of field:desc/asc (ex. createdAt:desc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of blogs
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BlogsResponse'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 */

/**
 * @swagger
 * /blogs/views:
 *   get:
 *     summary: Get blog views analytics
 *     description: Get analytics data for blog views within a date range. Only authenticated users with getViews permission can access this.
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: slug
 *         schema:
 *           type: string
 *         description: Filter by blog slug
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for analytics (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for analytics (YYYY-MM-DD)
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 views:
 *                   type: number
 *                   description: Total views count
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       views:
 *                         type: number
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /blogs/{blogId}:
 *   get:
 *     summary: Get a blog post
 *     description: Retrieve a specific blog post by its ID.
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a blog post
 *     description: Update an existing blog post. Only authenticated users with manageBlogs permission can access this.
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               seoTitle:
 *                 type: string
 *               seoDescription:
 *                 type: string
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               isFeatured:
 *                 type: boolean
 *               isPublished:
 *                 type: boolean
 *               isDraft:
 *                 type: boolean
 *               selectedImage:
 *                 type: string
 *             example:
 *               title: "Updated Blog Title"
 *               seoTitle: "Updated SEO Title"
 *               content: "Updated content..."
 *               isFeatured: true
 *               isPublished: true
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a blog post
 *     description: Delete a blog post. Only authenticated users with manageBlogs permission can access this.
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /blogs/create:
 *   post:
 *     summary: Create a new blog post manually
 *     description: Create a blog post directly without AI generation. Only authenticated users with manageBlogs permission can access this.
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - slug
 *               - seoTitle
 *               - seoDescription
 *               - author
 *               - content
 *               - category
 *               - topic
 *               - language
 *               - llmModel
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               seoTitle:
 *                 type: string
 *               seoDescription:
 *                 type: string
 *               author:
 *                 type: string
 *                 description: Author user ID
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               generatedImages:
 *                 type: array
 *                 items:
 *                   type: string
 *               selectedImage:
 *                 type: string
 *               topic:
 *                 type: string
 *               country:
 *                 type: string
 *               intent:
 *                 type: string
 *               audience:
 *                 type: string
 *               language:
 *                 type: string
 *               llmModel:
 *                 type: string
 *             example:
 *               title: "My Manual Blog Post"
 *               slug: "my-manual-blog-post"
 *               seoTitle: "Manual Blog Post SEO Title"
 *               seoDescription: "This is a manually created blog post"
 *               author: "507f1f77bcf86cd799439011"
 *               content: "Blog content here..."
 *               category: "Technology"
 *               topic: "Tech Topic"
 *               language: "english"
 *               llmModel: "gpt-4"
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /blogs/bulk-delete:
 *   delete:
 *     summary: Delete multiple blog posts
 *     description: Bulk delete blog posts by their IDs. Only authenticated users with manageBlogs permission can access this.
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - blogIds
 *             properties:
 *               blogIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of blog IDs to delete
 *             example:
 *               blogIds: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *     responses:
 *       "200":
 *         description: Blogs deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Blogs deleted successfully
 *                 deletedCount:
 *                   type: number
 *                   example: 2
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /blogs/search:
 *   get:
 *     summary: Search blog posts
 *     description: Search blog posts with advanced filtering and full-text search capabilities.
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query string
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Filter by blog title
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter by author ID
 *       - in: query
 *         name: isPublished
 *         schema:
 *           type: boolean
 *         description: Filter by published status
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *         description: Filter by featured status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort by query in the form of field:desc/asc
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BlogsResponse'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 */

/**
 * @swagger
 * /blogs/sitemap.xml:
 *   get:
 *     summary: Generate sitemap
 *     description: Generate XML sitemap for all published blog posts.
 *     tags: [Blogs]
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/xml:
 *             schema:
 *               type: string
 *       "500":
 *         $ref: '#/components/responses/InternalError'
 */

/**
 * @swagger
 * /blogs/robots.txt:
 *   get:
 *     summary: Generate robots.txt
 *     description: Generate robots.txt file for SEO and crawler configuration.
 *     tags: [Blogs]
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       "500":
 *         $ref: '#/components/responses/InternalError'
 */

/**
 * @swagger
 * /blogs/my-engagement-stats:
 *   get:
 *     summary: Get user's blog engagement statistics
 *     description: Get engagement statistics for all blogs created by the authenticated user. Only authenticated users can access this.
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalViews:
 *                   type: number
 *                 totalLikes:
 *                   type: number
 *                 totalDislikes:
 *                   type: number
 *                 totalComments:
 *                   type: number
 *                 blogs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       blogId:
 *                         type: string
 *                       title:
 *                         type: string
 *                       views:
 *                         type: number
 *                       likes:
 *                         type: number
 *                       dislikes:
 *                         type: number
 *                       comments:
 *                         type: number
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /blogs/{slug}/engagement-stats:
 *   get:
 *     summary: Get blog engagement statistics by slug
 *     description: Get engagement statistics for a specific blog post by its slug.
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog slug
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 views:
 *                   type: number
 *                 likes:
 *                   type: number
 *                 dislikes:
 *                   type: number
 *                 comments:
 *                   type: number
 *                 slug:
 *                   type: string
 *                 title:
 *                   type: string
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /blogs/{blogId}/publish:
 *   patch:
 *     summary: Publish a blog post
 *     description: Publish a blog post by setting isPublished to true. Only authenticated users with manageBlogs permission can access this.
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /blogs/{blogId}/unpublish:
 *   patch:
 *     summary: Unpublish a blog post
 *     description: Unpublish a blog post by setting isPublished to false. Only authenticated users with manageBlogs permission can access this.
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /blogs/{blogId}/toggle-featured:
 *   patch:
 *     summary: Toggle featured status of a blog post
 *     description: Toggle the isFeatured status of a blog post. Only authenticated users with manageBlogs permission can access this.
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /blogs/{blogId}/like:
 *   post:
 *     summary: Like a blog post
 *     description: Toggle like on a blog post. Authenticated users can like blog posts.
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Blog liked successfully
 *                 likes:
 *                   type: array
 *                   items:
 *                     type: string
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /blogs/{blogId}/dislike:
 *   post:
 *     summary: Dislike a blog post
 *     description: Toggle dislike on a blog post. Authenticated users can dislike blog posts.
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Blog disliked successfully
 *                 dislikes:
 *                   type: array
 *                   items:
 *                     type: string
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
