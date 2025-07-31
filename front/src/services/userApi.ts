import { api } from './api';
import { CACHE_TIMES } from '../utils/cacheConfig';

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  openAiKey?: string;
  hasOpenAiKey?: boolean;
}

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query<UserData, string>({
      query: (userId) => `/users/${userId}`,
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
      // Cache user data for longer periods using centralized config
      keepUnusedDataFor: CACHE_TIMES.USER_DATA,
    }),
    updateUser: builder.mutation<UserData, Partial<UserData> & { id: string }>({
      query: ({ id, ...patch }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
    }),
  }),
});

export const { useGetUserQuery, useUpdateUserMutation, useLazyGetUserQuery } = userApi;
