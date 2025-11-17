import Joi from 'joi';

export const createOrder = {
  body: Joi.object().keys({
    amount: Joi.number().required().min(1).description('Order amount'),
    currency: Joi.string().optional().default('INR').description('Currency code'),
    plan: Joi.string().optional().default('pro').description('Subscription plan'),
  }),
};

export const verifyPayment = {
  body: Joi.object().keys({
    razorpay_order_id: Joi.string().required().description('Razorpay order ID'),
    razorpay_payment_id: Joi.string().required().description('Razorpay payment ID'),
    razorpay_signature: Joi.string().required().description('Razorpay signature'),
    plan: Joi.string().optional().description('Subscription plan (optional, will be fetched from payment details)'),
    amount: Joi.number().optional().description('Payment amount (optional, will be fetched from payment details)'),
  }),
};

export const getPaymentDetails = {
  params: Joi.object().keys({
    paymentId: Joi.string().required().description('Razorpay payment ID'),
  }),
};

export const createRefund = {
  body: Joi.object().keys({
    paymentId: Joi.string().required().description('Razorpay payment ID to refund'),
    amount: Joi.number().optional().min(1).description('Refund amount (full refund if not specified)'),
  }),
};

export const webhookValidation = {
  headers: Joi.object()
    .keys({
      'x-razorpay-signature': Joi.string().required().description('Razorpay webhook signature'),
    })
    .unknown(true),
};
