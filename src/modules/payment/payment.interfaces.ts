import { Document, Model, Types } from 'mongoose';
import { QueryResult } from '../paginate/paginate';

export interface IRazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string | number | boolean>;
  created_at: number;
}

export interface ICreateOrderRequest {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: {
    userId: string;
    plan: string;
    [key: string]: string | number | boolean;
  };
}

export interface IVerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface IPaymentVerificationResult {
  success: boolean;
  message: string;
  orderId?: string;
  paymentId?: string;
}

export interface IPayment {
  userId: Types.ObjectId;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed';
  plan: string;
  notes: Record<string, unknown>;
}

export interface IPaymentDoc extends IPayment, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface IPaymentModel extends Model<IPaymentDoc> {
  paginate(filter: Record<string, unknown>, options: Record<string, unknown>): Promise<QueryResult>;
}
