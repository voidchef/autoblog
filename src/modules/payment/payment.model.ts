import mongoose from 'mongoose';
import paginate from '../paginate/paginate';
import toJSON from '../toJSON/toJSON';
import { IPaymentDoc, IPaymentModel } from './payment.interfaces';

const paymentSchema = new mongoose.Schema<IPaymentDoc, IPaymentModel>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      required: true,
      unique: true,
    },
    razorpaySignature: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'success',
    },
    plan: {
      type: String,
      default: 'pro',
    },
    notes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Add plugins
paymentSchema.plugin(toJSON);
paymentSchema.plugin(paginate);

// Add index for efficient queries
paymentSchema.index({ userId: 1, createdAt: -1 });

const Payment = mongoose.model<IPaymentDoc, IPaymentModel>('Payment', paymentSchema);

export default Payment;
