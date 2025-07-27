import express, { Router } from 'express';
import { validate } from '../../modules/validate';
import { auth } from '../../modules/auth';
import { appSettingsController, appSettingsValidation } from '../../modules/appSettings';

const router: Router = express.Router();

router.get('/', appSettingsController.getAppSettings);

router
  .route('/categories')
  .post(auth('manageAppSettings'), validate(appSettingsValidation.updateCategories), appSettingsController.updateCategories)
  .delete(
    auth('manageAppSettings'),
    validate(appSettingsValidation.deleteCategories),
    appSettingsController.deleteCategories,
  );

router
  .route('/selectFields')
  .post(
    auth('manageAppSettings'),
    validate(appSettingsValidation.updateSelectFields),
    appSettingsController.updateSelectFields,
  );

export default router;

/**
 * @swagger
 * tags:
 *   name: AppSettings
 *   description: Application settings management
 */

/**
 * @swagger
 * /appSettings:
 *   get:
 *     summary: Get application settings
 *     description: Retrieve all application settings including categories, languages, language models, and query types.
 *     tags: [AppSettings]
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppSettings'
 *       "500":
 *         $ref: '#/components/responses/InternalError'
 */

/**
 * @swagger
 * /appSettings/categories:
 *   post:
 *     summary: Update categories
 *     description: Add or update blog categories. Only authenticated users with manageAppSettings permission can access this.
 *     tags: [AppSettings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categories
 *             properties:
 *               categories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - categoryName
 *                     - categoryDescription
 *                     - categoryPicUrl
 *                   properties:
 *                     categoryName:
 *                       type: string
 *                       description: Name of the category
 *                     categoryDescription:
 *                       type: string
 *                       description: Description of the category
 *                     categoryPicUrl:
 *                       type: string
 *                       description: URL of the category image
 *             example:
 *               categories:
 *                 - categoryName: "Technology"
 *                   categoryDescription: "Latest technology trends and news"
 *                   categoryPicUrl: "https://example.com/tech.jpg"
 *                 - categoryName: "Health"
 *                   categoryDescription: "Health and wellness articles"
 *                   categoryPicUrl: "https://example.com/health.jpg"
 *     responses:
 *       "200":
 *         description: Categories updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppSettings'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   delete:
 *     summary: Delete categories
 *     description: Delete specified categories by their IDs. Only authenticated users with manageAppSettings permission can access this.
 *     tags: [AppSettings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryIds
 *             properties:
 *               categoryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of category IDs to delete
 *             example:
 *               categoryIds: ["60d5ecb54b20f20d5c4b5c73", "60d5ecb54b20f20d5c4b5c74"]
 *     responses:
 *       "200":
 *         description: Categories deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppSettings'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /appSettings/selectFields:
 *   post:
 *     summary: Update select fields
 *     description: Update application select fields like languages, language models, and query types. Only authenticated users with manageAppSettings permission can access this.
 *     tags: [AppSettings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               languages:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/FieldData'
 *                 description: Available languages
 *               languageModels:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/FieldData'
 *                 description: Available language models
 *               queryType:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/FieldData'
 *                 description: Available query types
 *             example:
 *               languages:
 *                 - value: "english"
 *                   label: "English"
 *                 - value: "spanish"
 *                   label: "Spanish"
 *               languageModels:
 *                 - value: "gpt-4"
 *                   label: "GPT-4"
 *                 - value: "claude-3-sonnet"
 *                   label: "Claude 3 Sonnet"
 *               queryType:
 *                 - value: "tutorial"
 *                   label: "Tutorial"
 *                 - value: "review"
 *                   label: "Review"
 *     responses:
 *       "200":
 *         description: Select fields updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppSettings'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */
