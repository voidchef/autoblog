import express, { Router } from 'express';
import { auth } from '../../modules/auth';
import { contactController, contactValidation, queryTypeController, queryTypeValidation } from '../../modules/contact';
import { validate } from '../../modules/validate';

const router: Router = express.Router();

// Public route - anyone can submit a contact message
router.post('/', validate(contactValidation.createContact), contactController.createContact);

// Query types routes - public GET, protected POST (admin only)
router
  .route('/query-types')
  .get(queryTypeController.getQueryTypes)
  .post(auth('manageUsers'), validate(queryTypeValidation.createQueryType), queryTypeController.createQueryType);

// Protected routes - only authenticated users (admins) can view/manage contacts
router.route('/').get(auth('manageUsers'), validate(contactValidation.getContacts), contactController.getContacts);

router
  .route('/:contactId')
  .get(auth('manageUsers'), validate(contactValidation.getContact), contactController.getContact)
  .patch(auth('manageUsers'), validate(contactValidation.updateContact), contactController.updateContact)
  .delete(auth('manageUsers'), validate(contactValidation.deleteContact), contactController.deleteContact);

export default router;

/**
 * @swagger
 * tags:
 *   name: Contact
 *   description: Contact message management and query types
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Contact:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the contact message
 *         name:
 *           type: string
 *           description: Full name of the person contacting
 *         email:
 *           type: string
 *           format: email
 *           description: Email address for follow-up
 *         queryType:
 *           type: string
 *           description: Type of query (e.g., support, feedback, sales)
 *         message:
 *           type: string
 *           description: The message content
 *         status:
 *           type: string
 *           enum: [new, in-progress, resolved]
 *           description: Current status of the contact message
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the message was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the message was last updated
 *       example:
 *         id: 507f1f77bcf86cd799439011
 *         name: John Doe
 *         email: john.doe@example.com
 *         queryType: support
 *         message: I need help with my account setup and configuration
 *         status: new
 *         createdAt: 2025-10-22T10:30:00.000Z
 *         updatedAt: 2025-10-22T10:30:00.000Z
 *
 *     QueryType:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the query type
 *         value:
 *           type: string
 *           description: Machine-readable value (slug)
 *         label:
 *           type: string
 *           description: Human-readable label
 *         description:
 *           type: string
 *           description: Description of the query type
 *         isActive:
 *           type: boolean
 *           description: Whether the query type is active
 *         order:
 *           type: integer
 *           description: Display order
 *       example:
 *         id: 507f1f77bcf86cd799439012
 *         value: support
 *         label: Technical Support
 *         description: Need help with technical issues
 *         isActive: true
 *         order: 1
 */

/**
 * @swagger
 * /contact:
 *   post:
 *     summary: Submit a contact message
 *     description: Public endpoint for submitting contact messages. No authentication required. A confirmation email will be sent to the provided email address.
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - queryType
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Full name of the person contacting
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address for follow-up
 *               queryType:
 *                 type: string
 *                 description: Type of query - must match one of the available query types
 *               message:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *                 description: The message content
 *             example:
 *               name: John Doe
 *               email: john.doe@example.com
 *               queryType: support
 *               message: I need help with my account setup and would like assistance with configuring my settings properly.
 *     responses:
 *       "201":
 *         description: Contact message created successfully. A confirmation email has been sent.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contact'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   get:
 *     summary: Get all contact messages (admin only)
 *     description: Retrieve a paginated list of contact messages with optional filtering. Only accessible to admin users with 'manageUsers' permission.
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, in-progress, resolved]
 *         description: Filter contacts by status
 *         example: new
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort by query in the form of field:desc/asc (ex. createdAt:desc)
 *         example: createdAt:desc
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         default: 10
 *         description: Maximum number of contacts per page
 *         example: 20
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *     responses:
 *       "200":
 *         description: Paginated list of contact messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Contact'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 totalResults:
 *                   type: integer
 *                   example: 47
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /contact/{id}:
 *   get:
 *     summary: Get a specific contact message (admin only)
 *     description: Retrieve detailed information about a specific contact message by ID. Only accessible to admin users with 'manageUsers' permission.
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the contact message
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       "200":
 *         description: Contact message retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Contact'
 *       "400":
 *         description: Invalid contact ID format
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a contact message status (admin only)
 *     description: Update the status of a contact message to track progress. Only accessible to admin users with 'manageUsers' permission.
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the contact message
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [new, in-progress, resolved]
 *                 description: New status for the contact message
 *             example:
 *               status: in-progress
 *     responses:
 *       "200":
 *         description: Contact message status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Contact'
 *       "400":
 *         description: Invalid contact ID or status value
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a contact message (admin only)
 *     description: Permanently delete a contact message from the database. Only accessible to admin users with 'manageUsers' permission. This action cannot be undone.
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the contact message to delete
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       "204":
 *         description: Contact message deleted successfully (no content returned)
 *       "400":
 *         description: Invalid contact ID format
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /contact/query-types:
 *   get:
 *     summary: Get all query types
 *     description: Retrieve all available query types for use in the contact form. This is a public endpoint that returns active query types by default, sorted by their order value. Inactive types can be included with a query parameter.
 *     tags: [Contact]
 *     parameters:
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Set to true to include inactive query types in the response
 *         example: false
 *     responses:
 *       "200":
 *         description: Query types retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/QueryType'
 *             example:
 *               - id: 507f1f77bcf86cd799439012
 *                 value: support
 *                 label: Technical Support
 *                 description: Need help with technical issues
 *                 isActive: true
 *                 order: 1
 *               - id: 507f1f77bcf86cd799439013
 *                 value: sales
 *                 label: Sales Inquiry
 *                 description: Questions about pricing and plans
 *                 isActive: true
 *                 order: 2
 *               - id: 507f1f77bcf86cd799439014
 *                 value: feedback
 *                 label: General Feedback
 *                 description: Share your thoughts with us
 *                 isActive: true
 *                 order: 3
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   post:
 *     summary: Create a new query type (admin only)
 *     description: Create a new query type option for the contact form. Only accessible to admin users with 'manageUsers' permission. Query types help categorize incoming messages.
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *               - label
 *             properties:
 *               value:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 description: Unique machine-readable identifier (slug)
 *                 example: support
 *               label:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Human-readable display label
 *                 example: Technical Support
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Optional description explaining when to use this query type
 *                 example: Need help with technical issues or bugs
 *               isActive:
 *                 type: boolean
 *                 default: true
 *                 description: Whether this query type should be shown in the contact form
 *                 example: true
 *               order:
 *                 type: integer
 *                 minimum: 0
 *                 description: Display order in the dropdown (lower numbers appear first)
 *                 example: 1
 *             example:
 *               value: partnership
 *               label: Partnership Opportunity
 *               description: Interested in partnering with us
 *               isActive: true
 *               order: 4
 *     responses:
 *       "201":
 *         description: Query type created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QueryType'
 *       "400":
 *         description: Invalid input data or duplicate value
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */
