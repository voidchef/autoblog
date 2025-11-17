import express, { Router } from 'express';
import { auth } from '../../modules/auth';
import { paymentController, paymentValidation } from '../../modules/payment';
import { validate } from '../../modules/validate';

const router: Router = express.Router();

router.route('/order').post(auth(), validate(paymentValidation.createOrder), paymentController.createOrder);

router.route('/verify').post(auth(), validate(paymentValidation.verifyPayment), paymentController.verifyPayment);

router.route('/history').get(auth(), paymentController.getPaymentHistory);

router.route('/analytics').get(auth('manageUsers'), paymentController.getPaymentAnalytics);

router
  .route('/refund')
  .post(auth('manageUsers'), validate(paymentValidation.createRefund), paymentController.createRefund);

router.route('/webhook').post(validate(paymentValidation.webhookValidation), paymentController.handleWebhook);

router
  .route('/:paymentId')
  .get(auth('manageUsers'), validate(paymentValidation.getPaymentDetails), paymentController.getPaymentDetails);

export default router;

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment and subscription management
 */

/**
 * @swagger
 * /payment/order:
 *   post:
 *     summary: Create a new Razorpay order
 *     description: Authenticated users can create a payment order for subscription
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 1
 *                 description: Amount in INR
 *               currency:
 *                 type: string
 *                 default: INR
 *                 description: Currency code
 *               plan:
 *                 type: string
 *                 default: pro
 *                 description: Subscription plan
 *             example:
 *               amount: 29
 *               currency: INR
 *               plan: pro
 *     responses:
 *       "201":
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Razorpay order ID
 *                 amount:
 *                   type: number
 *                 currency:
 *                   type: string
 *                 receipt:
 *                   type: string
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /payment/verify:
 *   post:
 *     summary: Verify Razorpay payment
 *     description: Verify payment signature after successful payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - razorpay_order_id
 *               - razorpay_payment_id
 *               - razorpay_signature
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *               razorpay_payment_id:
 *                 type: string
 *               razorpay_signature:
 *                 type: string
 *     responses:
 *       "200":
 *         description: Payment verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       "400":
 *         description: Payment verification failed
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /payment/{paymentId}:
 *   get:
 *     summary: Get payment details
 *     description: Only admins can fetch payment details
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Razorpay payment ID
 *     responses:
 *       "200":
 *         description: Payment details
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
