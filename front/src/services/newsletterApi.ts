import { api } from './api';

export interface NewsletterSubscriber {
  id: string;
  email: string;
  isActive: boolean;
  subscribedAt?: string;
  unsubscribedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscribeRequest {
  email: string;
}

export interface SubscribeResponse {
  message: string;
  subscriber: NewsletterSubscriber;
}

export interface UnsubscribeRequest {
  email: string;
}

export interface UnsubscribeResponse {
  message: string;
  subscriber: NewsletterSubscriber;
}

export const newsletterApi = api.injectEndpoints({
  endpoints: (builder) => ({
    subscribeNewsletter: builder.mutation<SubscribeResponse, SubscribeRequest>({
      query: (data) => ({
        url: '/newsletter/subscribe',
        method: 'POST',
        body: data,
      }),
    }),
    unsubscribeNewsletter: builder.mutation<UnsubscribeResponse, UnsubscribeRequest>({
      query: (data) => ({
        url: '/newsletter/unsubscribe',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const { useSubscribeNewsletterMutation, useUnsubscribeNewsletterMutation } = newsletterApi;
