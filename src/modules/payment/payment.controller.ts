import { Request, Response } from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import config from '../../config/config';
import * as emailService from '../email/email.service';
import logger from '../logger/logger';
import { IUserDoc } from '../user/user.interfaces';
import * as userService from '../user/user.service';
import catchAsync from '../utils/catchAsync';
import pick from '../utils/pick';
import * as paymentService from './payment.service';

/**
 * Create a new Razorpay order
 */
export const createOrder = catchAsync(async (req: Request, res: Response) => {
  const { amount, currency, plan } = req.body;
  const user = req.user as IUserDoc;
  const userId = user?._id;

  const orderData = {
    amount,
    currency: currency || 'INR',
    notes: {
      userId: userId?.toString() || 'guest',
      plan: plan || 'pro',
    },
  };

  const order = await paymentService.createOrder(orderData);
  res.status(httpStatus.CREATED).send(order);
});

/**
 * Verify Razorpay payment
 */
export const verifyPayment = catchAsync(async (req: Request, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const user = req.user as IUserDoc;
  const userId = user?._id;

  const verificationResult = await paymentService.verifyPayment({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });

  if (verificationResult.success) {
    // Fetch the order details to get amount and plan
    const orderDetails = (await paymentService.getPaymentDetails(razorpay_payment_id)) as {
      amount?: number;
      currency?: string;
      notes?: { plan?: string };
    };

    // Save payment to database
    if (userId && mongoose.Types.ObjectId.isValid(userId.toString())) {
      const plan = orderDetails?.notes?.plan || 'pro';
      const amount = (orderDetails?.amount || 0) / 100; // Convert from paise to rupees

      await paymentService.savePayment(
        new mongoose.Types.ObjectId(userId.toString()),
        { razorpay_order_id, razorpay_payment_id, razorpay_signature },
        amount,
        orderDetails?.currency || 'INR',
        plan
      );

      // Update user subscription status - each payment is for 1 month
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);

      await userService.updateUserById(new mongoose.Types.ObjectId(userId.toString()), {
        subscriptionPlan: plan,
        subscriptionStatus: 'active',
        subscriptionExpiresAt: expiryDate,
      });

      // Send payment success email
      try {
        await emailService.sendPaymentSuccessEmail(
          user.email,
          user.name,
          plan,
          amount,
          razorpay_payment_id,
          expiryDate
        );
      } catch (emailError) {
        // Log error but don't fail the payment
        logger.error('Failed to send payment success email:', emailError);
      }
    }

    res.status(httpStatus.OK).send({
      success: true,
      message: 'Payment verified successfully',
      data: verificationResult,
    });
  } else {
    res.status(httpStatus.BAD_REQUEST).send({
      success: false,
      message: 'Payment verification failed',
    });
  }
});

/**
 * Get payment details
 */
export const getPaymentDetails = catchAsync(async (req: Request, res: Response) => {
  const paymentId = req.params['paymentId'];
  if (typeof paymentId === 'string') {
    const paymentDetails = await paymentService.getPaymentDetails(paymentId);
    res.status(httpStatus.OK).send(paymentDetails);
  }
});

/**
 * Get user payment history
 */
export const getPaymentHistory = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserDoc;
  const userId = user?._id;

  if (!userId) {
    res.status(httpStatus.UNAUTHORIZED).send({ message: 'User not authenticated' });
    return;
  }

  const options = pick(req.query, ['sortBy', 'limit', 'page']) as Record<string, unknown>;
  const result = await paymentService.getUserPaymentHistory(new mongoose.Types.ObjectId(userId.toString()), options);
  res.status(httpStatus.OK).send(result);
});

/**
 * Create a refund
 */
export const createRefund = catchAsync(async (req: Request, res: Response) => {
  const { paymentId, amount } = req.body;

  // Find the payment record
  const payment = await paymentService.getPaymentById(paymentId);
  if (!payment) {
    res.status(httpStatus.NOT_FOUND).send({ message: 'Payment not found' });
    return;
  }

  // Create refund
  const refund = await paymentService.createRefund(payment.razorpayPaymentId, amount);

  // Update payment status
  await paymentService.updatePaymentStatus(paymentId, 'refunded');

  // Get user details and send confirmation email
  const user = await userService.getUserById(new mongoose.Types.ObjectId(payment.userId.toString()));
  if (user) {
    try {
      await emailService.sendRefundConfirmationEmail(
        user.email,
        user.name,
        (refund['amount'] as number) / 100,
        refund['id'] as string
      );
    } catch (emailError) {
      logger.error('Failed to send refund confirmation email:', emailError);
    }
  }

  res.status(httpStatus.CREATED).send({
    success: true,
    refundId: refund['id'],
    message: 'Refund processed successfully',
  });
});

/**
 * Handle Razorpay webhook
 */
export const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  const webhookSecret = config.razorpay.webhookSecret || '';
  const signature = req.headers['x-razorpay-signature'] as string;
  const webhookBody = JSON.stringify(req.body);

  // Verify webhook signature
  const isValid = paymentService.verifyWebhookSignature(webhookBody, signature, webhookSecret);

  if (!isValid) {
    res.status(httpStatus.BAD_REQUEST).send({ message: 'Invalid webhook signature' });
    return;
  }

  const event = req.body;
  const eventType = event.event;

  // Handle different webhook events
  switch (eventType) {
    case 'payment.authorized':
    case 'payment.captured':
      // Payment successful - already handled in verify payment
      break;

    case 'payment.failed':
      // Handle failed payment
      // You might want to update payment status in database
      break;

    case 'refund.created':
      // Handle refund created
      // Update user subscription status if refund is for subscription
      break;

    case 'refund.processed':
      // Refund has been processed
      break;

    default:
      // Unknown event type
      break;
  }

  res.status(httpStatus.OK).send({ success: true });
});

/**
 * Get payment analytics (Admin Only)
 */
export const getPaymentAnalytics = catchAsync(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;

  const start = startDate ? new Date(startDate as string) : undefined;
  const end = endDate ? new Date(endDate as string) : undefined;

  const analytics = await paymentService.getPaymentAnalytics(start, end);
  res.status(httpStatus.OK).send(analytics);
});
