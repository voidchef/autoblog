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
  googleApiKey?: string;
  hasGoogleApiKey?: boolean;
  wordpressSiteUrl?: string;
  wordpressUsername?: string;
  wordpressAppPassword?: string;
  hasWordPressConfig?: boolean;
  mediumIntegrationToken?: string;
  hasMediumConfig?: boolean;
  bio?: string;
  profilePicture?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  followers?: string[];
  following?: string[];
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
    followUser: builder.mutation<UserData, string>({
      query: (userId) => ({
        url: `/users/${userId}/follow`,
        method: 'POST',
      }),
      async onQueryStarted(userId, { dispatch, queryFulfilled, getState }) {
        try {
          const { data: updatedUser } = await queryFulfilled;
          // Update the cache for the current user
          const state = getState() as any;
          const currentUserId = state.auth.userId;
          if (currentUserId) {
            dispatch(
              userApi.util.updateQueryData('getUser', currentUserId, (draft) => {
                Object.assign(draft, updatedUser);
              })
            );
          }
        } catch {
          // Error handled by mutation
        }
      },
      invalidatesTags: (result, error, userId) => [
        { type: 'User', id: userId },
      ],
    }),
    unfollowUser: builder.mutation<UserData, string>({
      query: (userId) => ({
        url: `/users/${userId}/unfollow`,
        method: 'POST',
      }),
      async onQueryStarted(userId, { dispatch, queryFulfilled, getState }) {
        try {
          const { data: updatedUser } = await queryFulfilled;
          // Update the cache for the current user
          const state = getState() as any;
          const currentUserId = state.auth.userId;
          if (currentUserId) {
            dispatch(
              userApi.util.updateQueryData('getUser', currentUserId, (draft) => {
                Object.assign(draft, updatedUser);
              })
            );
          }
        } catch {
          // Error handled by mutation
        }
      },
      invalidatesTags: (result, error, userId) => [
        { type: 'User', id: userId },
      ],
    }),
    uploadProfilePicture: builder.mutation<UserData, { userId: string; file: File }>({
      query: ({ userId, file }) => {
        const formData = new FormData();
        formData.append('profilePicture', file);
        return {
          url: `/users/${userId}/profile-picture`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { userId }) => [{ type: 'User', id: userId }],
    }),
  }),
});

export const {
  useGetUserQuery,
  useUpdateUserMutation,
  useLazyGetUserQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useUploadProfilePictureMutation,
} = userApi;
