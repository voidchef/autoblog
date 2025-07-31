import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../services/authApi';

export type TokenData = {
  access: {
    token: string;
    expires: string;
  };
  refresh: {
    token: string;
    expires: string;
  };
};

interface AuthState {
  tokens: TokenData | null;
  userId: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  tokens: JSON.parse(localStorage.getItem('tokens') || 'null'),
  userId: localStorage.getItem('userId') || '',
  isLoading: false,
  error: null,
};

// Async thunks for complex auth flows
export const loginWithRedirect = createAsyncThunk(
  'auth/loginWithRedirect',
  async ({ email, password, navigate }: { email: string; password: string; navigate: Function }) => {
    // This will trigger the RTK Query mutation but allows for additional navigation logic
    navigate('/');
    return { email, password };
  },
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async ({ navigate }: { navigate?: Function }, { getState, dispatch }) => {
    const state = getState() as any;
    const refreshToken = state.auth.tokens?.refresh?.token;

    try {
      if (refreshToken) {
        // Call logout API
        await dispatch(authApi.endpoints.logout.initiate({ refreshToken }));
      }
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    }

    // Clear local storage
    localStorage.removeItem('tokens');
    localStorage.removeItem('userId');

    if (navigate) {
      navigate('/login');
    }
  },
);

export const refreshTokens = createAsyncThunk('auth/refreshTokens', async (_, { getState, dispatch, rejectWithValue }) => {
  const state = getState() as any;
  const refreshToken = state.auth.tokens?.refresh?.token;

  if (!refreshToken) {
    return rejectWithValue('No refresh token available');
  }

  try {
    const result = await dispatch(authApi.endpoints.refreshTokens.initiate({ refreshToken }));
    return result.data;
  } catch (error) {
    return rejectWithValue('Token refresh failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('tokens');
      localStorage.removeItem('userId');
      state.tokens = null;
      state.userId = '';
      state.isLoading = false;
      state.error = null;
    },
    setTokens: (state, action: PayloadAction<{ tokens: TokenData; userId: string }>) => {
      state.tokens = action.payload.tokens;
      state.userId = action.payload.userId;
      localStorage.setItem('tokens', JSON.stringify(action.payload.tokens));
      localStorage.setItem('userId', action.payload.userId);
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addMatcher(authApi.endpoints.login.matchPending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        state.isLoading = false;
        state.tokens = action.payload.tokens;
        state.userId = action.payload.user.id;
        localStorage.setItem('tokens', JSON.stringify(action.payload.tokens));
        localStorage.setItem('userId', action.payload.user.id);
        state.error = null;
      })
      .addMatcher(authApi.endpoints.login.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as any)?.message || 'Login failed';
      })
      // Register
      .addMatcher(authApi.endpoints.register.matchPending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.register.matchFulfilled, (state, action) => {
        state.isLoading = false;
        state.tokens = action.payload.tokens;
        state.userId = action.payload.user.id;
        localStorage.setItem('tokens', JSON.stringify(action.payload.tokens));
        localStorage.setItem('userId', action.payload.user.id);
        state.error = null;
      })
      .addMatcher(authApi.endpoints.register.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as any)?.message || 'Registration failed';
      })
      // Logout
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        localStorage.removeItem('tokens');
        localStorage.removeItem('userId');
        state.tokens = null;
        state.userId = '';
        state.isLoading = false;
        state.error = null;
      })
      // Refresh tokens
      .addMatcher(authApi.endpoints.refreshTokens.matchFulfilled, (state, action) => {
        state.tokens = action.payload.tokens;
        localStorage.setItem('tokens', JSON.stringify(action.payload.tokens));
      })
      .addMatcher(authApi.endpoints.refreshTokens.matchRejected, (state) => {
        // Token refresh failed, logout user
        localStorage.removeItem('tokens');
        localStorage.removeItem('userId');
        state.tokens = null;
        state.userId = '';
        state.error = 'Session expired';
      });
  },
});

export const { logout, setTokens, clearError, setError } = authSlice.actions;
export default authSlice.reducer;
