import crypto from 'crypto';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import config from '../../config/config';
import ApiError from '../errors/ApiError';
import logger from '../logger/logger';
import { QueryResult } from '../paginate/paginate';
import {
  ICreateOrderRequest,
  IPaymentDoc,
  IPaymentVerificationResult,
  IRazorpayOrder,
  IVerifyPaymentRequest,
} from './payment.interfaces';
import Payment from './payment.model';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

/**
 * Create a Razorpay order
 * @param {ICreateOrderRequest} orderData - Order creation data
 * @returns {Promise<IRazorpayOrder>}
 */
export const createOrder = async (orderData: ICreateOrderRequest): Promise<IRazorpayOrder> => {
  try {
    const options = {
      amount: orderData.amount * 100, // Convert to paise (smallest currency unit)
      currency: orderData.currency || 'INR',
      receipt: orderData.receipt || `receipt_${Date.now()}`,
      notes: orderData.notes || {},
    };

    const order = await razorpay.orders.create(options);
    logger.info(`Razorpay order created: ${order.id}`);
    return order as IRazorpayOrder;
  } catch (error) {
    logger.error('Error creating Razorpay order:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create payment order');
  }
};

/**
 * Verify Razorpay payment signature
 * @param {IVerifyPaymentRequest} paymentData - Payment verification data
 * @returns {Promise<IPaymentVerificationResult>}
 */
export const verifyPayment = async (paymentData: IVerifyPaymentRequest): Promise<IPaymentVerificationResult> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

    // Create expected signature
    const generatedSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Compare signatures
    if (generatedSignature === razorpay_signature) {
      logger.info(`Payment verified successfully: ${razorpay_payment_id}`);
      return {
        success: true,
        message: 'Payment verified successfully',
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      };
    } else {
      logger.warn(`Payment verification failed: ${razorpay_payment_id}`);
      return {
        success: false,
        message: 'Payment verification failed',
      };
    }
  } catch (error) {
    logger.error('Error verifying payment:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to verify payment');
  }
};

/**
 * Fetch payment details from Razorpay
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<Record<string, unknown>>}
 */
export const getPaymentDetails = async (paymentId: string): Promise<Record<string, unknown>> => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment as unknown as Record<string, unknown>;
  } catch (error) {
    logger.error(`Error fetching payment details for ${paymentId}:`, error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch payment details');
  }
};

/**
 * Save payment to database
 * @param {mongoose.Types.ObjectId} userId - User ID
 * @param {IVerifyPaymentRequest} paymentData - Payment data
 * @param {number} amount - Amount paid
 * @param {string} currency - Currency
 * @param {string} plan - Subscription plan
 * @returns {Promise<IPaymentDoc>}
 */
export const savePayment = async (
  userId: mongoose.Types.ObjectId,
  paymentData: IVerifyPaymentRequest,
  amount: number,
  currency: string = 'INR',
  plan: string = 'pro'
): Promise<IPaymentDoc> => {
  try {
    const payment = await Payment.create({
      userId,
      razorpayOrderId: paymentData.razorpay_order_id,
      razorpayPaymentId: paymentData.razorpay_payment_id,
      razorpaySignature: paymentData.razorpay_signature,
      amount,
      currency,
      status: 'success',
      plan,
      notes: {},
    });
    logger.info(`Payment saved to database: ${payment.id}`);
    return payment;
  } catch (error) {
    logger.error('Error saving payment to database:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to save payment');
  }
};

/**
 * Get user payment history
 * @param {mongoose.Types.ObjectId} userId - User ID
 * @param {Record<string, unknown>} options - Query options
 * @returns {Promise<QueryResult>}
 */
export const getUserPaymentHistory = async (
  userId: mongoose.Types.ObjectId,
  options: Record<string, unknown>
): Promise<QueryResult> => {
  try {
    const filter = { userId };
    const payments = await Payment.paginate(filter, {
      ...options,
      sortBy: (options['sortBy'] as string) || 'createdAt:desc',
    });
    return payments;
  } catch (error) {
    logger.error(`Error fetching payment history for user ${userId}:`, error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch payment history');
  }
};

/**
 * Get payment analytics
 * @param {Date} startDate - Start date for analytics
 * @param {Date} endDate - End date for analytics
 * @returns {Promise<Record<string, unknown>>}
 */
export const getPaymentAnalytics = async (startDate?: Date, endDate?: Date): Promise<Record<string, unknown>> => {
  try {
    const matchStage: Record<string, unknown> = { status: 'success' };

    if (startDate || endDate) {
      matchStage['createdAt'] = {};
      if (startDate) {
        (matchStage['createdAt'] as Record<string, unknown>)['$gte'] = startDate;
      }
      if (endDate) {
        (matchStage['createdAt'] as Record<string, unknown>)['$lte'] = endDate;
      }
    }

    // Total revenue and transaction count
    const revenueStats = await Payment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalTransactions: { $sum: 1 },
          avgTransactionValue: { $avg: '$amount' },
        },
      },
    ]);

    // Revenue by plan
    const revenueByPlan = await Payment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$plan',
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    // Monthly revenue trend
    const monthlyRevenue = await Payment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$amount' },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    // Daily revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'success',
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          revenue: { $sum: '$amount' },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    // Active subscriptions count
    const User = mongoose.model('User');
    const activeSubscriptions = await User.countDocuments({
      subscriptionStatus: 'active',
      subscriptionExpiresAt: { $gt: new Date() },
    });

    const totalSubscriptions = await User.countDocuments({
      subscriptionPlan: { $ne: 'free' },
    });

    return {
      overview: {
        totalRevenue: revenueStats[0]?.totalRevenue || 0,
        totalTransactions: revenueStats[0]?.totalTransactions || 0,
        avgTransactionValue: revenueStats[0]?.avgTransactionValue || 0,
        activeSubscriptions,
        totalSubscriptions,
      },
      revenueByPlan: revenueByPlan.map((item) => ({
        plan: item._id,
        revenue: item.revenue,
        count: item.count,
      })),
      monthlyRevenue: monthlyRevenue.map((item) => ({
        year: item._id.year,
        month: item._id.month,
        revenue: item.revenue,
        transactions: item.transactions,
      })),
      dailyRevenue: dailyRevenue.map((item) => ({
        date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
        revenue: item.revenue,
        transactions: item.transactions,
      })),
    };
  } catch (error) {
    logger.error('Error fetching payment analytics:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch payment analytics');
  }
};

/**
 * Create a refund for a payment
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Amount to refund (optional, full refund if not specified)
 * @returns {Promise<Record<string, unknown>>}
 */
export const createRefund = async (paymentId: string, amount?: number): Promise<Record<string, unknown>> => {
  try {
    const refundData: { payment_id: string; amount?: number } = { payment_id: paymentId };
    if (amount) {
      refundData.amount = amount * 100; // Convert to paise
    }

    const refund = await razorpay.payments.refund(paymentId, refundData);
    logger.info(`Refund created for payment ${paymentId}: ${refund.id}`);
    return refund as unknown as Record<string, unknown>;
  } catch (error) {
    logger.error(`Error creating refund for payment ${paymentId}:`, error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create refund');
  }
};

/**
 * Get payment by ID
 * @param {string} paymentId - Payment document ID
 * @returns {Promise<IPaymentDoc | null>}
 */
export const getPaymentById = async (paymentId: string): Promise<IPaymentDoc | null> => {
  return Payment.findById(paymentId);
};

/**
 * Update payment status
 * @param {string} paymentId - Payment document ID
 * @param {string} status - New payment status
 * @returns {Promise<IPaymentDoc | null>}
 */
export const updatePaymentStatus = async (paymentId: string, status: string): Promise<IPaymentDoc | null> => {
  return Payment.findByIdAndUpdate(paymentId, { status }, { new: true });
};

/**
 * Verify webhook signature
 * @param {string} webhookBody - Raw webhook body
 * @param {string} signature - Webhook signature from header
 * @param {string} webhookSecret - Webhook secret
 * @returns {boolean}
 */
export const verifyWebhookSignature = (webhookBody: string, signature: string, webhookSecret: string): boolean => {
  try {
    const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(webhookBody).digest('hex');
    return expectedSignature === signature;
  } catch (error) {
    logger.error('Error verifying webhook signature:', error);
    return false;
  }
};
