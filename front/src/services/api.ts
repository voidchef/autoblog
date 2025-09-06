import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import { CACHE_TIMES } from '../utils/cacheConfig';

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
        const authResponse = refreshResult.data as any;
        api.dispatch({
          type: 'auth/setTokens',
          payload: {
            tokens: authResponse.tokens,
            userId: state.auth.userId,
          }
        });

        // Retry the original query with new token
        result = await baseQueryWithRetry(args, api, extraOptions);
      } else {
        // Refresh failed, logout user by clearing tokens
        api.dispatch({ type: 'auth/logout' });
      }
    } else {
      // No refresh token available, logout user
      api.dispatch({ type: 'auth/logout' });
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
  // More conservative refetch policies to prevent excessive API calls
  refetchOnMountOrArgChange: false, // Only refetch when explicitly triggered
  refetchOnFocus: false, // Don't refetch on window focus
  refetchOnReconnect: false, // Don't refetch on network reconnection
  // Keep data for longer periods using centralized config
  keepUnusedDataFor: CACHE_TIMES.USER_DATA, // Default to moderate caching
});
