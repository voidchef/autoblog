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
 *   description: Contact message management
 */

/**
 * @swagger
 * /contact:
 *   post:
 *     summary: Submit a contact message
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
 *                 description: Type of query (e.g., support, feedback, sales)
 *               message:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *                 description: The message content
 *             example:
 *               name: John Doe
 *               email: john.doe@example.com
 *               queryType: support
 *               message: I need help with my account setup
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 queryType:
 *                   type: string
 *                 message:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [new, in-progress, resolved]
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *
 *   get:
 *     summary: Get all contact messages (admin only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, in-progress, resolved]
 *         description: Filter by status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. createdAt:desc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of contacts
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
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Contact'
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalResults:
 *                   type: integer
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /contact/{id}:
 *   get:
 *     summary: Get a contact message (admin only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Contact'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a contact message status (admin only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [new, in-progress, resolved]
 *             example:
 *               status: in-progress
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Contact'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a contact message (admin only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact id
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
 * /contact/query-types:
 *   get:
 *     summary: Get all query types
 *     description: Retrieve all active query types for contact form (public endpoint)
 *     tags: [Contact]
 *     parameters:
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *         description: Include inactive query types (default false)
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   value:
 *                     type: string
 *                   label:
 *                     type: string
 *                   description:
 *                     type: string
 *                   isActive:
 *                     type: boolean
 *                   order:
 *                     type: integer
 *
 *   post:
 *     summary: Create a query type (admin only)
 *     description: Create a new query type for contact form
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
 *               label:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *                 default: true
 *               order:
 *                 type: integer
 *             example:
 *               value: support
 *               label: Technical Support
 *               description: Need help with technical issues
 *               isActive: true
 *               order: 1
 *     responses:
 *       "201":
 *         description: Created
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */
