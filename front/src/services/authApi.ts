import { api } from './api';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RefreshTokenData {
  refreshToken: string;
}

export interface LogoutData {
  refreshToken: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface OAuthConnection {
  id: string;
  provider: 'google' | 'apple';
  email: string;
  displayName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OAuthConnectionsResponse {
  connections: OAuthConnection[];
}

export interface OAuthConnectionStatus {
  provider: string;
  email: string;
  isActive: boolean;
  isTokenExpired: boolean;
  tokenExpiry?: string;
  hasRefreshToken: boolean;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    isEmailVerified: boolean;
    hasOpenAiKey?: boolean;
  };
  tokens: {
    access: {
      token: string;
      expires: string;
    };
    refresh: {
      token: string;
      expires: string;
    };
  };
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginData>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth', 'User'],
      transformErrorResponse: (response: { status: number; data: any }) => {
        return response.data?.message || 'Login failed';
      },
    }),

    register: builder.mutation<AuthResponse, RegisterData>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth', 'User'],
      transformErrorResponse: (response: { status: number; data: any }) => {
        return response.data?.message || 'Registration failed';
      },
    }),

    logout: builder.mutation<void, LogoutData>({
      query: (data) => ({
        url: '/auth/logout',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auth', 'User'],
    }),

    refreshTokens: builder.mutation<AuthResponse, RefreshTokenData>({
      query: (data) => ({
        url: '/auth/refresh-tokens',
        method: 'POST',
        body: data,
      }),
    }),

    forgotPassword: builder.mutation<{ message: string }, ForgotPasswordData>({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
      transformErrorResponse: (response: { status: number; data: any }) => {
        return response.data?.message || 'Password reset request failed';
      },
    }),

    resetPassword: builder.mutation<{ message: string }, ResetPasswordData>({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
      transformErrorResponse: (response: { status: number; data: any }) => {
        return response.data?.message || 'Password reset failed';
      },
    }),

    verifyEmail: builder.mutation<{ message: string }, { token: string }>({
      query: (data) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    sendVerificationEmail: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/auth/send-verification-email',
        method: 'POST',
      }),
    }),

    // OAuth Connections Management
    getOAuthConnections: builder.query<OAuthConnectionsResponse, void>({
      query: () => '/oauth-connections',
      providesTags: ['OAuthConnections'],
    }),

    getOAuthConnectionStatus: builder.query<OAuthConnectionStatus, string>({
      query: (connectionId) => `/oauth-connections/${connectionId}/status`,
    }),

    refreshOAuthConnection: builder.mutation<{ message: string; tokenExpiry: string }, string>({
      query: (connectionId) => ({
        url: `/oauth-connections/${connectionId}/refresh`,
        method: 'POST',
      }),
      invalidatesTags: ['OAuthConnections'],
    }),

    unlinkOAuthConnection: builder.mutation<void, string>({
      query: (connectionId) => ({
        url: `/oauth-connections/${connectionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['OAuthConnections', 'User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshTokensMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useSendVerificationEmailMutation,
  useGetOAuthConnectionsQuery,
  useGetOAuthConnectionStatusQuery,
  useRefreshOAuthConnectionMutation,
  useUnlinkOAuthConnectionMutation,
} = authApi;
