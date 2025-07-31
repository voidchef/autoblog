import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
  // Global loading states
  globalLoading: boolean;

  // Modal states
  modals: {
    isCreatePostModalOpen: boolean;
    isDeleteConfirmModalOpen: boolean;
    isEditProfileModalOpen: boolean;
    isBulkActionsModalOpen: boolean;
  };

  // Sidebar and navigation
  isSidebarOpen: boolean;
  activeRoute: string;

  // Search and filters
  searchQuery: string;
  activeFilters: {
    category: string | null;
    status: 'all' | 'published' | 'draft' | 'featured';
    dateRange: {
      startDate: string | null;
      endDate: string | null;
    };
  };

  // Notifications and toast
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    autoHide: boolean;
    duration?: number;
  }>;

  // Table and list states
  selectedItems: string[];
  sortConfig: {
    field: string;
    direction: 'asc' | 'desc';
  };

  // Theme and preferences
  preferences: {
    viewMode: 'grid' | 'list';
    itemsPerPage: number;
    autoRefresh: boolean;
  };
}

const initialState: UIState = {
  globalLoading: false,
  modals: {
    isCreatePostModalOpen: false,
    isDeleteConfirmModalOpen: false,
    isEditProfileModalOpen: false,
    isBulkActionsModalOpen: false,
  },
  isSidebarOpen: true,
  activeRoute: '/',
  searchQuery: '',
  activeFilters: {
    category: null,
    status: 'all',
    dateRange: {
      startDate: null,
      endDate: null,
    },
  },
  notifications: [],
  selectedItems: [],
  sortConfig: {
    field: 'createdAt',
    direction: 'desc',
  },
  preferences: {
    viewMode: 'grid',
    itemsPerPage: 10,
    autoRefresh: false,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Global loading
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },

    // Modal actions
    openModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach((key) => {
        state.modals[key as keyof UIState['modals']] = false;
      });
    },

    // Sidebar
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
    },

    // Navigation
    setActiveRoute: (state, action: PayloadAction<string>) => {
      state.activeRoute = action.payload;
    },

    // Search and filters
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setActiveFilter: (state, action: PayloadAction<{ key: keyof UIState['activeFilters']; value: any }>) => {
      const { key, value } = action.payload;
      state.activeFilters[key] = value;
    },
    clearFilters: (state) => {
      state.activeFilters = {
        category: null,
        status: 'all',
        dateRange: {
          startDate: null,
          endDate: null,
        },
      };
      state.searchQuery = '';
    },

    // Notifications
    addNotification: (state, action: PayloadAction<Omit<UIState['notifications'][0], 'id'>>) => {
      const notification = {
        ...action.payload,
        id: Date.now().toString(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((notification) => notification.id !== action.payload);
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },

    // Item selection
    toggleItemSelection: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      const index = state.selectedItems.indexOf(itemId);
      if (index > -1) {
        state.selectedItems.splice(index, 1);
      } else {
        state.selectedItems.push(itemId);
      }
    },
    selectAllItems: (state, action: PayloadAction<string[]>) => {
      state.selectedItems = action.payload;
    },
    clearItemSelection: (state) => {
      state.selectedItems = [];
    },

    // Sorting
    setSortConfig: (state, action: PayloadAction<UIState['sortConfig']>) => {
      state.sortConfig = action.payload;
    },

    // Preferences
    setPreference: (
      state,
      action: PayloadAction<{
        key: keyof UIState['preferences'];
        value: UIState['preferences'][keyof UIState['preferences']];
      }>,
    ) => {
      const { key, value } = action.payload;
      (state.preferences as any)[key] = value;
    },
    updatePreferences: (state, action: PayloadAction<Partial<UIState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
  },
});

export const {
  setGlobalLoading,
  openModal,
  closeModal,
  closeAllModals,
  toggleSidebar,
  setSidebarOpen,
  setActiveRoute,
  setSearchQuery,
  setActiveFilter,
  clearFilters,
  addNotification,
  removeNotification,
  clearAllNotifications,
  toggleItemSelection,
  selectAllItems,
  clearItemSelection,
  setSortConfig,
  setPreference,
  updatePreferences,
} = uiSlice.actions;

export default uiSlice.reducer;
