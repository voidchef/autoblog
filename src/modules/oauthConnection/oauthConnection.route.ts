import express, { Router } from 'express';
import { auth } from '../auth';
import * as oauthConnectionController from './oauthConnection.controller';

const router: Router = express.Router();

// All routes require authentication
router.use(auth());

// Get all OAuth connections for the authenticated user
router.get('/', oauthConnectionController.getConnections);

// Get status of a specific connection
router.get('/:connectionId/status', oauthConnectionController.getConnectionStatus);

// Refresh token for a specific connection
router.post('/:connectionId/refresh', oauthConnectionController.refreshConnectionToken);

// Unlink an OAuth connection
router.delete('/:connectionId', oauthConnectionController.unlinkConnection);

export default router;

/**
 * @swagger
 * tags:
 *   name: OAuth Connections
 *   description: OAuth connection management
 */

/**
 * @swagger
 * /oauth-connections:
 *   get:
 *     summary: Get all OAuth connections
 *     description: Retrieve all OAuth connections (Google, Apple) for the authenticated user
 *     tags: [OAuth Connections]
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
 *                 connections:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       provider:
 *                         type: string
 *                         enum: [google, apple]
 *                       email:
 *                         type: string
 *                       displayName:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /oauth-connections/{connectionId}/status:
 *   get:
 *     summary: Get OAuth connection status
 *     description: Get detailed status of a specific OAuth connection including token expiry information
 *     tags: [OAuth Connections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: OAuth connection ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 provider:
 *                   type: string
 *                   enum: [google, apple]
 *                 email:
 *                   type: string
 *                 isActive:
 *                   type: boolean
 *                 isTokenExpired:
 *                   type: boolean
 *                 tokenExpiry:
 *                   type: string
 *                   format: date-time
 *                 hasRefreshToken:
 *                   type: boolean
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /oauth-connections/{connectionId}/refresh:
 *   post:
 *     summary: Refresh OAuth connection token
 *     description: Manually refresh the access token for an OAuth connection using the refresh token
 *     tags: [OAuth Connections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: OAuth connection ID
 *     responses:
 *       "200":
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Token refreshed successfully
 *       "400":
 *         description: No refresh token available
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /oauth-connections/{connectionId}:
 *   delete:
 *     summary: Unlink OAuth connection
 *     description: Remove an OAuth connection from the user's account. User must have at least one authentication method (password or another OAuth connection) remaining.
 *     tags: [OAuth Connections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: OAuth connection ID
 *     responses:
 *       "200":
 *         description: Connection unlinked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OAuth connection unlinked successfully
 *       "400":
 *         description: Cannot unlink - would leave user with no authentication method
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               code: 400
 *               message: Cannot unlink OAuth connection. You must have a password or another OAuth connection to maintain access to your account
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
