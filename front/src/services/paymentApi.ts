import { api } from './api';

export interface CreateOrderRequest {
  amount: number;
  currency?: string;
  plan?: string;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, any>;
  created_at: number;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  data?: {
    success: boolean;
    message: string;
    orderId?: string;
    paymentId?: string;
  };
}

export interface PaymentHistoryItem {
  id: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  currency: string;
  status: string;
  plan: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentHistoryResponse {
  results: PaymentHistoryItem[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface PaymentAnalytics {
  overview: {
    totalRevenue: number;
    totalTransactions: number;
    avgTransactionValue: number;
    activeSubscriptions: number;
    totalSubscriptions: number;
  };
  revenueByPlan: Array<{
    plan: string;
    revenue: number;
    count: number;
  }>;
  monthlyRevenue: Array<{
    year: number;
    month: number;
    revenue: number;
    transactions: number;
  }>;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    transactions: number;
  }>;
}

export const paymentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<RazorpayOrder, CreateOrderRequest>({
      query: (orderData) => ({
        url: '/payment/order',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Payment'],
    }),
    verifyPayment: builder.mutation<PaymentVerificationResponse, VerifyPaymentRequest>({
      query: (paymentData) => ({
        url: '/payment/verify',
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: ['Payment'],
    }),
    getPaymentHistory: builder.query<PaymentHistoryResponse, { page?: number; limit?: number; sortBy?: string }>({
      query: ({ page = 1, limit = 10, sortBy = 'createdAt:desc' }) => ({
        url: '/payment/history',
        method: 'GET',
        params: { page, limit, sortBy },
      }),
      providesTags: ['Payment'],
    }),
    getPaymentAnalytics: builder.query<PaymentAnalytics, { startDate?: string; endDate?: string }>({
      query: ({ startDate, endDate }) => ({
        url: '/payment/analytics',
        method: 'GET',
        params: { startDate, endDate },
      }),
      providesTags: ['Payment'],
    }),
  }),
});

export const { useCreateOrderMutation, useVerifyPaymentMutation, useGetPaymentHistoryQuery, useGetPaymentAnalyticsQuery } = paymentApi;
