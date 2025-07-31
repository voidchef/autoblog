import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

// Enhanced base query with retry logic and better error handling
const baseQuery = fetchBaseQuery({
  baseUrl: '/v1',
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.tokens?.access?.token;

    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Add retry logic with exponential backoff
const baseQueryWithRetry = retry(baseQuery, {
  maxRetries: 3,
});

// Enhanced base query with token refresh logic
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQueryWithRetry(args, api, extraOptions);

  // Handle token refresh on 401 errors
  if (result.error && result.error.status === 401) {
    const state = api.getState() as RootState;
    const refreshToken = state.auth.tokens?.refresh?.token;

    if (refreshToken) {
      // Try to refresh the token
      const refreshResult = await baseQueryWithRetry(
        {
          url: '/auth/refresh-tokens',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions,
      );

      if (refreshResult.data) {
        // Store the new tokens
        api.dispatch({
          type: 'auth/setTokens',
          payload: {
            tokens: refreshResult.data,
            userId: state.auth.userId,
          },
        });

        // Retry the original query with new token
        result = await baseQueryWithRetry(args, api, extraOptions);
      } else {
        // Refresh failed, logout user
        api.dispatch({ type: 'auth/logout' });
        api.dispatch({ type: 'user/logout' });
      }
    }
  }

  return result;
};

// Create the enhanced API slice
export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Blog', 'AppSettings', 'Auth', 'Category', 'Draft'],
  endpoints: () => ({}),
  refetchOnMountOrArgChange: 30, // Refetch data if it's older than 30 seconds
  refetchOnFocus: true,
  refetchOnReconnect: true,
});
