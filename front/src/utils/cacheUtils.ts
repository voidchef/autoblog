import { api } from '../services/api';
import { userApi } from '../services/userApi';
import { appSettingsApi } from '../services/appSettingsApi';
import store from '../store';

/**
 * Utility functions for manual cache management
 * Use these when you need to explicitly refresh data
 */

export const cacheUtils = {
  /**
   * Invalidate user data cache
   */
  invalidateUser: (userId?: string) => {
    if (userId) {
      store.dispatch(api.util.invalidateTags([{ type: 'User', id: userId }]));
    } else {
      store.dispatch(api.util.invalidateTags(['User']));
    }
  },

  /**
   * Invalidate app settings cache
   */
  invalidateAppSettings: () => {
    store.dispatch(api.util.invalidateTags(['AppSettings']));
  },

  /**
   * Invalidate all blog related cache
   */
  invalidateBlogs: () => {
    store.dispatch(api.util.invalidateTags(['Blog', 'Category', 'Draft']));
  },

  /**
   * Prefetch user data
   */
  prefetchUser: (userId: string) => {
    store.dispatch(userApi.endpoints.getUser.initiate(userId));
  },

  /**
   * Prefetch app settings
   */
  prefetchAppSettings: () => {
    store.dispatch(appSettingsApi.endpoints.getAppSettings.initiate());
  },

  /**
   * Clear all cache
   */
  clearAllCache: () => {
    store.dispatch(api.util.resetApiState());
  },

  /**
   * Get cache statistics
   */
  getCacheStats: () => {
    const state = store.getState();
    return {
      apiState: state.api,
      queryCount: Object.keys(state.api.queries).length,
      subscriptionCount: Object.keys(state.api.subscriptions).length,
    };
  },
};

/**
 * Hook for accessing cache utilities in components
 */
export const useCacheUtils = () => cacheUtils;
