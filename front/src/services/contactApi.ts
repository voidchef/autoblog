import { api } from './api';

export interface ContactMessage {
  name: string;
  email: string;
  queryType: string;
  message: string;
}

export interface ContactResponse {
  id: string;
  name: string;
  email: string;
  queryType: string;
  message: string;
  status: 'new' | 'in-progress' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

export interface QueryType {
  id: string;
  value: string;
  label: string;
  description?: string;
  isActive: boolean;
  order: number;
}

export const contactApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createContact: builder.mutation<ContactResponse, ContactMessage>({
      query: (contactData) => ({
        url: '/contact',
        method: 'POST',
        body: contactData,
      }),
    }),
    getQueryTypes: builder.query<QueryType[], void>({
      query: () => '/contact/query-types',
      providesTags: ['QueryTypes'],
    }),
  }),
});

export const { useCreateContactMutation, useGetQueryTypesQuery } = contactApi;
