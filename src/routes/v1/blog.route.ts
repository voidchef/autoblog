import express, { Router } from 'express';
import { auth } from '../../modules/auth';
import { blogController, blogValidation } from '../../modules/blog';
import { uploadTemplate } from '../../modules/blog/template-upload.middleware';
import { validate } from '../../modules/validate';

const router: Router = express.Router();

router
  .route('/')
  .post(auth('generateBlogs'), validate(blogValidation.generateBlog), blogController.generateBlog)
  .get(validate(blogValidation.getBlogs), blogController.getBlogs);

// Template-based blog generation routes
router
  .route('/generate-from-template')
  .post(
    auth('generateBlogs'),
    uploadTemplate.single('template'),
    validate(blogValidation.generateBlogFromTemplate),
    blogController.generateBlogFromTemplate
  );

router
  .route('/template-preview')
  .post(auth('generateBlogs'), uploadTemplate.single('template'), blogController.getTemplatePreviewFromFile);

router.route('/create').post(auth('manageBlogs'), validate(blogValidation.createBlog), blogController.createBlog);
router
  .route('/bulk-delete')
  .delete(auth('manageBlogs'), validate(blogValidation.bulkDeleteBlogs), blogController.bulkDeleteBlogs);
router.route('/search').get(validate(blogValidation.getBlogs), blogController.searchBlogs);
router.route('/sitemap.xml').get(blogController.generateSitemap);
router.route('/robots.txt').get(blogController.generateRobots);

router.route('/views').get(auth('getViews'), validate(blogValidation.getViews), blogController.getViews);

// Analytics routes
router
  .route('/analytics/comprehensive')
  .get(auth('getViews'), validate(blogValidation.getComprehensiveAnalytics), blogController.getComprehensiveAnalytics);

router
  .route('/analytics/overview')
  .get(auth('getViews'), validate(blogValidation.getAnalyticsByTimeRange), blogController.getAnalyticsByTimeRange);

router
  .route('/analytics/events')
  .get(auth('getViews'), validate(blogValidation.getEventBasedAnalytics), blogController.getEventBasedAnalytics);

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

// Audio narration routes
router.route('/:blogId/audio').post(auth('manageBlogs'), blogController.generateAudioNarration);
router.route('/:blogId/audio').get(blogController.getAudioNarrationStatus);

// Blog generation status route
router.route('/:blogId/generation-status').get(auth('generateBlogs'), blogController.getBlogGenerationStatus);

// Publishing routes
router.route('/:blogId/publish-wordpress').post(auth('manageBlogs'), blogController.publishToWordPress);
router.route('/:blogId/publish-medium').post(auth('manageBlogs'), blogController.publishToMedium);

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
 * /blogs/generate-from-template:
 *   post:
 *     summary: Generate a blog post from a template file
 *     description: Upload a markdown template file with special tags ({{s:}}, {{c:}}, {{i:}}) and generate a blog post using AI. Variables in the template (e.g., {variableName}) will be replaced with provided values. Only authenticated users with generateBlogs permission can access this.
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - template
 *               - input
 *               - llmModel
 *               - category
 *             properties:
 *               template:
 *                 type: string
 *                 format: binary
 *                 description: Markdown template file (.md or .markdown) with template tags
 *               input:
 *                 type: string
 *                 description: JSON string of key-value pairs for template variables (e.g., '{"breed":"Labrador","country":"USA"}')
 *                 example: '{"breed":"Golden Retriever","audience":"dog owners"}'
 *               llmModel:
 *                 type: string
 *                 description: Language model to use for generation
 *                 enum: [gpt-4o, gpt-4o-mini, o1-preview, o1-mini, mistral-small-latest, mistral-medium-latest, mistral-large-latest, gemini-2.5-flash, gemini-2.5-pro, gemini-2.0-flash, claude, groq]
 *                 example: gpt-4o
 *               llmProvider:
 *                 type: string
 *                 description: AI provider for the model
 *                 enum: [openai, google, mistral]
 *                 example: openai
 *               category:
 *                 type: string
 *                 description: Blog category
 *                 example: Pets
 *               tags:
 *                 type: string
 *                 description: JSON string array of blog tags
 *                 example: '["dogs","breeds","pets"]'
 *               generateImages:
 *                 type: string
 *                 enum: ['true', 'false']
 *                 description: Whether to generate images for the blog post
 *                 default: 'true'
 *               generateHeadingImages:
 *                 type: string
 *                 enum: ['true', 'false']
 *                 description: Whether to generate images for each heading
 *                 default: 'false'
 *               imagesPerSection:
 *                 type: string
 *                 description: Number of images to generate per section
 *                 example: '2'
 *           encoding:
 *             template:
 *               contentType: text/markdown, application/octet-stream
 *     responses:
 *       "201":
 *         description: Blog post generated successfully from template
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *         description: Bad request - Invalid template file, missing required fields, or invalid JSON input
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "500":
 *         description: Internal server error - AI generation failed
 *     x-codeSamples:
 *       - lang: cURL
 *         source: |
 *           curl -X POST "http://localhost:3000/api/v1/blogs/generate-from-template" \
 *             -H "Authorization: Bearer YOUR_TOKEN" \
 *             -F "template=@dog-breed-template.md" \
 *             -F 'input={"breed":"Golden Retriever"}' \
 *             -F "llmModel=gpt-4o" \
 *             -F "llmProvider=openai" \
 *             -F "category=Pets" \
 *             -F 'tags=["dogs","breeds"]' \
 *             -F "generateImages=true"
 *       - lang: JavaScript
 *         source: |
 *           const formData = new FormData();
 *           formData.append('template', templateFile);
 *           formData.append('input', JSON.stringify({ breed: 'Labrador' }));
 *           formData.append('llmModel', 'gpt-4o');
 *           formData.append('category', 'Pets');
 *
 *           const response = await fetch('/api/v1/blogs/generate-from-template', {
 *             method: 'POST',
 *             headers: {
 *               'Authorization': 'Bearer YOUR_TOKEN'
 *             },
 *             body: formData
 *           });
 */

/**
 * @swagger
 * /blogs/template-preview:
 *   post:
 *     summary: Preview a template file
 *     description: Upload a template file to extract and preview its structure - system prompt, number of content/image sections, and required variables. This is useful for validating templates before generation. Only authenticated users with generateBlogs permission can access this.
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - template
 *             properties:
 *               template:
 *                 type: string
 *                 format: binary
 *                 description: Markdown template file (.md or .markdown)
 *           encoding:
 *             template:
 *               contentType: text/markdown, application/octet-stream
 *     responses:
 *       "200":
 *         description: Template preview retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 systemPrompt:
 *                   type: string
 *                   description: The system prompt extracted from the template ({{s:...}} tag)
 *                   example: "You are an SEO specialist writing about {breed}. Use a neutral tone."
 *                 contentPromptCount:
 *                   type: integer
 *                   description: Number of content sections ({{c:...}} tags) in the template
 *                   example: 5
 *                 imagePromptCount:
 *                   type: integer
 *                   description: Number of image sections ({{i:...}} tags) in the template
 *                   example: 2
 *                 variables:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of unique variable names found in the template (e.g., {variableName})
 *                   example: ["breed", "audience", "country"]
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *         description: Bad request - Invalid template file or format
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *     x-codeSamples:
 *       - lang: cURL
 *         source: |
 *           curl -X POST "http://localhost:3000/api/v1/blogs/template-preview" \
 *             -H "Authorization: Bearer YOUR_TOKEN" \
 *             -F "template=@my-template.md"
 *       - lang: JavaScript
 *         source: |
 *           const formData = new FormData();
 *           formData.append('template', templateFile);
 *
 *           const response = await fetch('/api/v1/blogs/template-preview', {
 *             method: 'POST',
 *             headers: {
 *               'Authorization': 'Bearer YOUR_TOKEN'
 *             },
 *             body: formData
 *           });
 *           const preview = await response.json();
 *           console.log('Variables:', preview.variables);
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

/**
 * @swagger
 * /blogs/{blogId}/audio:
 *   post:
 *     summary: Generate audio narration for a blog post
 *     description: Generate AI-powered audio narration using Google Cloud Text-to-Speech. The audio is stored in AWS S3. Only authenticated users with manageBlogs permission can access this.
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
 *         description: Audio narration generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Audio narration generated successfully
 *                 audioNarrationUrl:
 *                   type: string
 *                   example: https://s3.amazonaws.com/bucket/audio/blog-audio.mp3
 *                 audioGenerationStatus:
 *                   type: string
 *                   enum: [completed, processing, pending, failed]
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalError'
 *
 *   get:
 *     summary: Get audio narration status
 *     description: Retrieve the audio narration status and URL for a blog post.
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
 *               type: object
 *               properties:
 *                 audioNarrationUrl:
 *                   type: string
 *                   nullable: true
 *                   example: https://s3.amazonaws.com/bucket/audio/blog-audio.mp3
 *                 audioGenerationStatus:
 *                   type: string
 *                   enum: [completed, processing, pending, failed]
 *                   example: completed
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /blogs/{blogId}/publish-wordpress:
 *   post:
 *     summary: Publish blog post to WordPress
 *     description: Publish a blog post to a connected WordPress site using WordPress REST API. Only authenticated users with manageBlogs permission can access this.
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
 *         description: Blog published to WordPress successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Blog published to WordPress successfully
 *                 wordpressPostId:
 *                   type: string
 *                   example: "12345"
 *                 wordpressUrl:
 *                   type: string
 *                   example: https://example.wordpress.com/post-title
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalError'
 */

/**
 * @swagger
 * /blogs/{blogId}/publish-medium:
 *   post:
 *     summary: Publish blog post to Medium
 *     description: Publish a blog post to Medium using the Medium API. Only authenticated users with manageBlogs permission can access this.
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
 *         description: Blog published to Medium successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Blog published to Medium successfully
 *                 mediumPostId:
 *                   type: string
 *                   example: "abc123def456"
 *                 mediumUrl:
 *                   type: string
 *                   example: https://medium.com/@user/post-title-abc123def456
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalError'
 */

/**
 * @swagger
 * /blogs/analytics/comprehensive:
 *   get:
 *     summary: Get comprehensive analytics
 *     description: Get comprehensive analytics including GA data and database engagement stats for a custom date range
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 overview:
 *                   type: object
 *                 blogsPerformance:
 *                   type: array
 *                 trafficSources:
 *                   type: array
 *                 dailyTrends:
 *                   type: array
 *                 topPerformers:
 *                   type: array
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /blogs/analytics/overview:
 *   get:
 *     summary: Get analytics by time range
 *     description: Get analytics for a predefined time range (7d, 30d, 90d, 1y)
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *           default: 30d
 *         description: Time range for analytics
 *     responses:
 *       "200":
 *         description: OK
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /blogs/analytics/events:
 *   get:
 *     summary: Get event-based analytics
 *     description: Get analytics for custom events (likes, shares, audio plays) from Google Analytics
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalLikes:
 *                       type: number
 *                     totalShares:
 *                       type: number
 *                     totalAudioPlays:
 *                       type: number
 *                 byBlog:
 *                   type: array
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */
