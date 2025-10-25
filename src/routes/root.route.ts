import express, { Router } from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import config from '../config/config';

const router: Router = express.Router();

router.get('/', (_req, res) => {
  res.status(httpStatus.OK).json({
    message: '🚀 Welcome to the AutoBlog API! The robots are writing themselves... literally.',
    status: 'online',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    tip: 'Check /health for system status or /v1/docs for API documentation',
  });
});

router.get('/health', (_req, res) => {
  res.status(httpStatus.OK).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: config.env,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

export default router;

/**
 * @swagger
 * tags:
 *   name: System
 *   description: System information and health check endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     WelcomeResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Welcome message
 *         status:
 *           type: string
 *           description: API status
 *         version:
 *           type: string
 *           description: API version
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Current server timestamp
 *         tip:
 *           type: string
 *           description: Helpful tip for API usage
 *       example:
 *         message: 🚀 Welcome to the AutoBlog API! The robots are writing themselves... literally.
 *         status: online
 *         version: 1.0.0
 *         timestamp: 2025-10-25T21:00:00.000Z
 *         tip: Check /health for system status or /v1/docs for API documentation
 *
 *     HealthResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [healthy, unhealthy]
 *           description: Overall health status of the API
 *         uptime:
 *           type: number
 *           description: Server uptime in seconds
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Current server timestamp
 *         environment:
 *           type: string
 *           enum: [development, production, test]
 *           description: Current environment
 *         mongodb:
 *           type: string
 *           enum: [connected, disconnected]
 *           description: MongoDB connection status
 *       example:
 *         status: healthy
 *         uptime: 3600.5
 *         timestamp: 2025-10-25T21:00:00.000Z
 *         environment: development
 *         mongodb: connected
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: API Welcome endpoint
 *     description: Returns a welcome message with basic API information. This is the root endpoint of the API.
 *     tags: [System]
 *     responses:
 *       "200":
 *         description: Welcome message with API information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WelcomeResponse'
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API, including server uptime, environment, and database connection status. Useful for monitoring and load balancers.
 *     tags: [System]
 *     responses:
 *       "200":
 *         description: API health status with system information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
