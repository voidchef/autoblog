import crypto from 'crypto';
import { faker } from '@faker-js/faker';
import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import bcrypt from 'bcryptjs';
import httpStatus from 'http-status';
import moment from 'moment';
import mongoose from 'mongoose';

// Mock Razorpay - create mocks that can be referenced in the factory
const mockOrders = {
  create: jest.fn<(...args: any[]) => Promise<any>>(),
  fetch: jest.fn<(...args: any[]) => Promise<any>>(),
};

const mockPayments = {
  fetch: jest.fn<(...args: any[]) => Promise<any>>(),
  refund: jest.fn<(...args: any[]) => Promise<any>>(),
};

// Use jest.unstable_mockModule for ESM compatibility
jest.unstable_mockModule('razorpay', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    orders: mockOrders,
    payments: mockPayments,
  })),
}));

jest.unstable_mockModule('../email/email.service', () => ({
  __esModule: true,
  sendEmail: jest.fn(),
  sendResetPasswordEmail: jest.fn(),
  sendVerificationEmail: jest.fn(),
  sendSuccessfulRegistration: jest.fn(),
  sendAccountCreated: jest.fn(),
  sendPaymentSuccessEmail: jest.fn(),
  sendSubscriptionExpiryWarning: jest.fn(),
  sendNewsletterWelcomeEmail: jest.fn(),
  sendRefundConfirmationEmail: jest.fn(),
  getTransport: jest.fn(),
  transport: {},
  setTransport: jest.fn(),
}));

// Now import modules that depend on Razorpay
const { default: request } = await import('supertest');
const { default: app } = await import('../../app');
const { default: config } = await import('../../config/config');
const emailService = await import('../email/email.service');
const { default: setupTestDB } = await import('../jest/setupTestDB');
const tokenService = await import('../token/token.service');
const { default: tokenTypes } = await import('../token/token.types');
const { default: User } = await import('../user/user.model');
const { default: Payment } = await import('./payment.model');
const paymentServiceModule = await import('./payment.service');

setupTestDB();

// Mock Razorpay config values for testing
const RAZORPAY_KEY_SECRET = 'test_key_secret';
const RAZORPAY_WEBHOOK_SECRET = 'test_webhook_secret';

// Override config for tests
Object.assign(config.razorpay, {
  keyId: 'test_key_id',
  keySecret: RAZORPAY_KEY_SECRET,
  webhookSecret: RAZORPAY_WEBHOOK_SECRET,
});

const password = 'password1';
const salt = bcrypt.genSaltSync(8);
const hashedPassword = bcrypt.hashSync(password, salt);
const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');

const userOne = {
  _id: new mongoose.Types.ObjectId(),
  name: faker.person.fullName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: 'user',
  isEmailVerified: true,
  subscriptionPlan: 'free',
  subscriptionStatus: 'inactive',
};

const admin = {
  _id: new mongoose.Types.ObjectId(),
  name: faker.person.fullName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: 'admin',
  isEmailVerified: true,
};

const userOneAccessToken = tokenService.generateToken(userOne._id, accessTokenExpires, tokenTypes.ACCESS);
const adminAccessToken = tokenService.generateToken(admin._id, accessTokenExpires, tokenTypes.ACCESS);

describe('Payment routes', () => {
  beforeEach(async () => {
    await User.create([
      { ...userOne, password: hashedPassword },
      { ...admin, password: hashedPassword },
    ]);

    // Clear mock call history but keep implementations
    mockOrders.create.mockClear();
    mockOrders.fetch.mockClear();
    mockPayments.fetch.mockClear();
    mockPayments.refund.mockClear();
  });
  describe('POST /v1/payment/order', () => {
    test('should return 200 and create payment order for authenticated user', async () => {
      const orderResponse = {
        id: `order_${faker.string.alphanumeric(14)}`,
        entity: 'order',
        amount: 99900,
        currency: 'INR',
        status: 'created',
      };

      mockOrders.create.mockResolvedValue(orderResponse);

      const res = await request(app)
        .post('/v1/payment/order')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ amount: 999, currency: 'INR', plan: 'pro' })
        .expect(httpStatus.CREATED);

      expect(res.body.id).toBe(orderResponse.id);
      expect(res.body.amount).toBe(orderResponse.amount);
      expect(res.body.currency).toBe(orderResponse.currency);
      expect(res.body.status).toBe('created');

      expect(mockOrders.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 99900,
          currency: 'INR',
          notes: {
            userId: userOne._id.toString(),
            plan: 'pro',
          },
          receipt: expect.stringMatching(/^receipt_\d+$/),
        })
      );
    });

    test('should return 401 if not authenticated', async () => {
      await request(app)
        .post('/v1/payment/order')
        .send({ amount: 999, currency: 'INR', plan: 'pro' })
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 if amount is missing', async () => {
      await request(app)
        .post('/v1/payment/order')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ currency: 'INR', plan: 'pro' })
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /v1/payment/verify', () => {
    test('should return 200 and activate subscription on valid payment', async () => {
      const orderId = `order_${faker.string.alphanumeric(14)}`;
      const paymentId = `pay_${faker.string.alphanumeric(14)}`;

      // Create payment verification signature
      const generatedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      // Mock razorpay.payments.fetch to return payment details
      mockPayments.fetch.mockResolvedValue({
        id: paymentId,
        order_id: orderId,
        amount: 99900, // in paise
        currency: 'INR',
        status: 'captured',
        notes: {
          plan: 'pro',
        },
      });

      const paymentData = {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: generatedSignature,
        plan: 'pro',
        amount: 999,
      };

      const res = await request(app)
        .post('/v1/payment/verify')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(paymentData)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('verified successfully');

      // Check that payment was saved
      const payment = await Payment.findOne({ razorpayOrderId: orderId });
      expect(payment).toBeDefined();
      expect(payment?.userId.toString()).toBe(userOne._id.toString());
      expect(payment?.status).toBe('success');
      expect(payment?.plan).toBe('pro');

      // Check that user subscription was updated
      const updatedUser = await User.findById(userOne._id);
      expect(updatedUser?.subscriptionPlan).toBe('pro');
      expect(updatedUser?.subscriptionStatus).toBe('active');
      expect(updatedUser?.subscriptionExpiresAt).toBeDefined();

      // Check that email was sent
      expect(emailService.sendPaymentSuccessEmail).toHaveBeenCalledWith(
        userOne.email,
        userOne.name,
        'pro',
        999,
        paymentId,
        expect.any(Date)
      );
    });

    test('should return 400 on invalid signature', async () => {
      const paymentData = {
        razorpay_order_id: 'order_123',
        razorpay_payment_id: 'pay_123',
        razorpay_signature: 'invalid_signature',
        plan: 'pro',
        amount: 999,
      };

      await request(app)
        .post('/v1/payment/verify')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(paymentData)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 if not authenticated', async () => {
      await request(app)
        .post('/v1/payment/verify')
        .send({
          razorpay_order_id: 'order_123',
          razorpay_payment_id: 'pay_123',
          razorpay_signature: 'sig_123',
          plan: 'pro',
          amount: 999,
        })
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /v1/payment/history', () => {
    beforeEach(async () => {
      // Create some payment history
      await Payment.create([
        {
          userId: userOne._id,
          razorpayOrderId: 'order_1',
          razorpayPaymentId: 'pay_1',
          razorpaySignature: 'sig_1',
          amount: 999,
          currency: 'INR',
          status: 'success',
          plan: 'pro',
        },
        {
          userId: userOne._id,
          razorpayOrderId: 'order_2',
          razorpayPaymentId: 'pay_2',
          razorpaySignature: 'sig_2',
          amount: 999,
          currency: 'INR',
          status: 'success',
          plan: 'pro',
        },
      ]);
    });

    test('should return 200 and payment history for authenticated user', async () => {
      const res = await request(app)
        .get('/v1/payment/history')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);

      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0].userId).toBe(userOne._id.toString());
      expect(res.body.results[0].status).toBe('success');
    });

    test('should support pagination', async () => {
      const res = await request(app)
        .get('/v1/payment/history')
        .query({ limit: 1, page: 1 })
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);

      expect(res.body.results).toHaveLength(1);
      expect(res.body.totalPages).toBe(2);
      expect(res.body.totalResults).toBe(2);
    });

    test('should return 401 if not authenticated', async () => {
      await request(app).get('/v1/payment/history').expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /v1/payment/refund', () => {
    let paymentId: string;

    beforeEach(async () => {
      const payment = await Payment.create({
        userId: userOne._id,
        razorpayOrderId: 'order_refund',
        razorpayPaymentId: 'pay_refund',
        razorpaySignature: 'sig_refund',
        amount: 999,
        currency: 'INR',
        status: 'success',
        plan: 'pro',
      });
      paymentId = payment._id.toString();
    });

    test('should return 200 and process refund for admin', async () => {
      const refundResponse = {
        id: `rfnd_${faker.string.alphanumeric(14)}`,
        entity: 'refund',
        amount: 99900,
        status: 'processed',
      };

      mockPayments.refund.mockResolvedValue(refundResponse);

      const res = await request(app)
        .post('/v1/payment/refund')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ paymentId })
        .expect(httpStatus.CREATED);

      expect(res.body.success).toBe(true);
      expect(res.body.refundId).toBe(refundResponse.id);

      // Check payment status updated
      const payment = await Payment.findById(paymentId);
      expect(payment?.status).toBe('refunded');

      // Check email sent
      expect(emailService.sendRefundConfirmationEmail).toHaveBeenCalled();
    });

    test('should return 403 if user is not admin', async () => {
      await request(app)
        .post('/v1/payment/refund')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ paymentId })
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 404 if payment not found', async () => {
      const invalidPaymentId = new mongoose.Types.ObjectId().toString();

      await request(app)
        .post('/v1/payment/refund')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ paymentId: invalidPaymentId })
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('GET /v1/payment/analytics', () => {
    beforeEach(async () => {
      // Create payment data for analytics
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

      await Payment.create([
        {
          userId: userOne._id,
          razorpayOrderId: 'order_a1',
          razorpayPaymentId: 'pay_a1',
          razorpaySignature: 'sig_a1',
          amount: 999,
          currency: 'INR',
          status: 'success',
          plan: 'pro',
          createdAt: now,
        },
        {
          userId: userOne._id,
          razorpayOrderId: 'order_a2',
          razorpayPaymentId: 'pay_a2',
          razorpaySignature: 'sig_a2',
          amount: 999,
          currency: 'INR',
          status: 'success',
          plan: 'pro',
          createdAt: lastMonth,
        },
      ]);
    });

    test('should return 200 and analytics data for admin', async () => {
      const res = await request(app)
        .get('/v1/payment/analytics')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('overview');
      expect(res.body.overview).toHaveProperty('totalRevenue');
      expect(res.body.overview).toHaveProperty('totalTransactions');
      expect(res.body.overview).toHaveProperty('avgTransactionValue');
      expect(res.body).toHaveProperty('revenueByPlan');
      expect(res.body).toHaveProperty('monthlyRevenue');
      expect(res.body).toHaveProperty('dailyRevenue');
    });

    test('should return 403 if user is not admin', async () => {
      await request(app)
        .get('/v1/payment/analytics')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should support date range filtering', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const res = await request(app)
        .get('/v1/payment/analytics')
        .query({ startDate, endDate })
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('overview');
      expect(res.body.overview).toHaveProperty('totalRevenue');
      expect(res.body.overview.totalTransactions).toBe(1); // Only recent payment
    });
  });

  describe('POST /v1/payment/webhook', () => {
    test('should process webhook with valid signature', async () => {
      const webhookBody = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_webhook',
              order_id: 'order_webhook',
              amount: 99900,
              status: 'captured',
            },
          },
        },
      };

      const webhookSignature = crypto
        .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
        .update(JSON.stringify(webhookBody))
        .digest('hex');

      const res = await request(app)
        .post('/v1/payment/webhook')
        .set('x-razorpay-signature', webhookSignature)
        .send(webhookBody)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
    });

    test('should return 400 for invalid webhook signature', async () => {
      const webhookBody = {
        event: 'payment.captured',
        payload: {},
      };

      await request(app)
        .post('/v1/payment/webhook')
        .set('x-razorpay-signature', 'invalid_signature')
        .send(webhookBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});

describe('Payment service', () => {
  beforeEach(async () => {
    await User.create({ ...userOne, password: hashedPassword });
  });

  describe('savePayment', () => {
    test('should save payment to database', async () => {
      const paymentData = {
        razorpay_order_id: 'order_service',
        razorpay_payment_id: 'pay_service',
        razorpay_signature: 'sig_service',
      };

      const payment = await paymentServiceModule.savePayment(userOne._id, paymentData, 999, 'INR', 'pro');

      expect(payment).toBeDefined();
      expect(payment.userId.toString()).toBe(userOne._id.toString());
      expect(payment.razorpayOrderId).toBe(paymentData.razorpay_order_id);
      expect(payment.status).toBe('success');
    });
  });

  describe('getUserPaymentHistory', () => {
    beforeEach(async () => {
      await Payment.create([
        {
          userId: userOne._id,
          razorpayOrderId: 'order_h1',
          razorpayPaymentId: 'pay_h1',
          razorpaySignature: 'sig_h1',
          amount: 999,
          currency: 'INR',
          status: 'success',
          plan: 'pro',
        },
        {
          userId: userOne._id,
          razorpayOrderId: 'order_h2',
          razorpayPaymentId: 'pay_h2',
          razorpaySignature: 'sig_h2',
          amount: 999,
          currency: 'INR',
          status: 'success',
          plan: 'pro',
        },
      ]);
    });

    test('should return user payment history', async () => {
      const result = await paymentServiceModule.getUserPaymentHistory(userOne._id, {
        page: 1,
        limit: 10,
      });

      expect(result.results).toHaveLength(2);
      expect(result.totalResults).toBe(2);
    });

    test('should support pagination', async () => {
      const result = await paymentServiceModule.getUserPaymentHistory(userOne._id, {
        page: 1,
        limit: 1,
      });

      expect(result.results).toHaveLength(1);
      expect(result.totalPages).toBe(2);
    });
  });

  describe('verifyWebhookSignature', () => {
    test('should return true for valid signature', () => {
      const body = { event: 'test', data: 'sample' };
      const bodyString = JSON.stringify(body);
      const signature = crypto.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET).update(bodyString).digest('hex');

      const isValid = paymentServiceModule.verifyWebhookSignature(bodyString, signature, RAZORPAY_WEBHOOK_SECRET);
      expect(isValid).toBe(true);
    });

    test('should return false for invalid signature', () => {
      const body = { event: 'test', data: 'sample' };
      const bodyString = JSON.stringify(body);
      const isValid = paymentServiceModule.verifyWebhookSignature(
        bodyString,
        'invalid_signature',
        RAZORPAY_WEBHOOK_SECRET
      );
      expect(isValid).toBe(false);
    });
  });

  describe('getPaymentAnalytics', () => {
    beforeEach(async () => {
      await Payment.create([
        {
          userId: userOne._id,
          razorpayOrderId: 'order_analytics1',
          razorpayPaymentId: 'pay_analytics1',
          razorpaySignature: 'sig_analytics1',
          amount: 999,
          currency: 'INR',
          status: 'success',
          plan: 'pro',
        },
        {
          userId: userOne._id,
          razorpayOrderId: 'order_analytics2',
          razorpayPaymentId: 'pay_analytics2',
          razorpaySignature: 'sig_analytics2',
          amount: 1999,
          currency: 'INR',
          status: 'success',
          plan: 'premium',
        },
      ]);
    });

    test('should return analytics data', async () => {
      const analytics = (await paymentServiceModule.getPaymentAnalytics()) as any;

      expect(analytics['overview']).toBeDefined();
      expect(analytics['overview']['totalRevenue']).toBe(2998);
      expect(analytics['overview']['totalTransactions']).toBe(2);
      expect(analytics['overview']['avgTransactionValue']).toBeCloseTo(1499);
      expect(analytics['revenueByPlan']).toBeDefined();
      expect(analytics['monthlyRevenue']).toBeDefined();
      expect(analytics['dailyRevenue']).toBeDefined();
    });

    test('should filter by date range', async () => {
      const startDate = new Date(Date.now() - 1000 * 60 * 60 * 24); // 1 day ago
      const endDate = new Date();

      const analytics = (await paymentServiceModule.getPaymentAnalytics(startDate, endDate)) as any;

      expect(analytics).toBeDefined();
      expect(analytics['overview']).toBeDefined();
      expect(analytics['overview']['totalRevenue']).toBeGreaterThanOrEqual(0);
    });
  });
});
