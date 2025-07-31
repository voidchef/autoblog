import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { userApi } from '../services/userApi';
import { authApi } from '../services/authApi';

export type UserData = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  isEmailVerified?: boolean;
  avatar?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  openAiKey?: string;
  hasOpenAiKey?: boolean;
  preferences?: {
    theme: 'light' | 'dark';
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
};

interface UserState {
  isAuthenticated: boolean | null;
  userData: UserData;
  loading: boolean;
  error: string | null;
  allUsers: UserData[];
  usersPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    search: string;
    role: string;
    isEmailVerified?: boolean;
  };
  selectedUsers: string[];
}

const initialState: UserState = {
  isAuthenticated: null,
  userData: {},
  loading: false,
  error: null,
  allUsers: [],
  usersPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    search: '',
    role: '',
  },
  selectedUsers: [],
};

// Enhanced async thunks for complex user operations
export const updateProfileWithRedirect = createAsyncThunk(
  'user/updateProfileWithRedirect',
  async ({ profileData, navigate }: { profileData: Partial<UserData>; navigate?: Function }, { dispatch }) => {
    // Since we only have updateUser endpoint, we'll use that
    const result = await dispatch(userApi.endpoints.updateUser.initiate(profileData as any));
    if ('data' in result) {
      if (navigate) {
        navigate('/profile');
      }
      return result.data;
    }
    throw new Error('Failed to update profile');
  },
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = null;
      state.userData = {};
      state.loading = false;
      state.error = null;
      state.allUsers = [];
      state.selectedUsers = [];
    },
    clearError: (state) => {
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<UserState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        search: '',
        role: '',
      };
    },
    setPagination: (state, action: PayloadAction<Partial<UserState['usersPagination']>>) => {
      state.usersPagination = { ...state.usersPagination, ...action.payload };
    },
    selectUser: (state, action: PayloadAction<string>) => {
      if (!state.selectedUsers.includes(action.payload)) {
        state.selectedUsers.push(action.payload);
      }
    },
    deselectUser: (state, action: PayloadAction<string>) => {
      state.selectedUsers = state.selectedUsers.filter((id) => id !== action.payload);
    },
    toggleUserSelection: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      if (state.selectedUsers.includes(userId)) {
        state.selectedUsers = state.selectedUsers.filter((id) => id !== userId);
      } else {
        state.selectedUsers.push(userId);
      }
    },
    selectAllUsers: (state) => {
      state.selectedUsers = state.allUsers.map((user) => user.id!).filter(Boolean);
    },
    clearSelection: (state) => {
      state.selectedUsers = [];
    },
    updateUserDataOptimistic: (state, action: PayloadAction<Partial<UserData>>) => {
      state.userData = { ...state.userData, ...action.payload };
    },
    updateUserPreferences: (state, action: PayloadAction<{ userId: string; preferences: UserData['preferences'] }>) => {
      const { userId, preferences } = action.payload;

      if (state.userData.id === userId) {
        state.userData.preferences = preferences;
      }

      const userIndex = state.allUsers.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.allUsers[userIndex].preferences = preferences;
      }
    },
    setAuthenticationStatus: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle user query states
      .addMatcher(userApi.endpoints.getUser.matchPending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(userApi.endpoints.getUser.matchFulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addMatcher(userApi.endpoints.getUser.matchRejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.error.message || 'Failed to fetch user data';
      })
      // Handle user update states
      .addMatcher(userApi.endpoints.updateUser.matchPending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(userApi.endpoints.updateUser.matchFulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;

        // Update in allUsers array if exists
        const userIndex = state.allUsers.findIndex((user) => user.id === action.payload.id);
        if (userIndex !== -1) {
          state.allUsers[userIndex] = action.payload;
        }

        state.error = null;
      })
      .addMatcher(userApi.endpoints.updateUser.matchRejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update user';
      })
      // Handle auth success states
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        state.userData = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.register.matchFulfilled, (state, action) => {
        state.userData = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.login.matchRejected, (state, action) => {
        state.isAuthenticated = false;
        state.error = action.error.message || 'Login failed';
      })
      .addMatcher(authApi.endpoints.register.matchRejected, (state, action) => {
        state.isAuthenticated = false;
        state.error = action.error.message || 'Registration failed';
      });
  },
});

export const {
  logout,
  clearError,
  setError,
  updateFilters,
  resetFilters,
  setPagination,
  selectUser,
  deselectUser,
  toggleUserSelection,
  selectAllUsers,
  clearSelection,
  updateUserDataOptimistic,
  updateUserPreferences,
  setAuthenticationStatus,
} = userSlice.actions;

export default userSlice.reducer;
