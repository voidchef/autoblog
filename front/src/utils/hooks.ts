import { useEffect, useMemo, useState } from 'react';
import { useAppSelector, useAppDispatch } from './reduxHooks';
import { useGetUserQuery } from '../services/userApi';
import { useGetAppSettingsQuery } from '../services/appSettingsApi';
import { useGetFeaturedBlogsQuery, useGetBlogsQuery } from '../services/blogApi';
import { showError } from '../actions';

/**
 * Custom hook for managing user authentication and data
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { tokens, userId } = useAppSelector((state) => state.auth);
  const { isAuthenticated, userData } = useAppSelector((state) => state.user);

  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useGetUserQuery(userId, {
    skip: !userId,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (userError) {
      dispatch(showError('Failed to load user data'));
    }
  }, [userError, dispatch]);

  return {
    isAuthenticated: !!tokens && !!userId,
    user: userData || user,
    isLoading: userLoading,
    tokens,
    userId,
  };
};

/**
 * Custom hook for managing app settings
 */
export const useAppSettings = () => {
  const dispatch = useAppDispatch();
  const appSettings = useAppSelector((state) => state.appSettings);

  const {
    data: settingsData,
    isLoading,
    error,
  } = useGetAppSettingsQuery(undefined, {
    refetchOnMountOrArgChange: 30, // Refetch if data is older than 30 seconds
  });

  useEffect(() => {
    if (error) {
      dispatch(showError('Failed to load app settings'));
    }
  }, [error, dispatch]);

  return {
    ...appSettings,
    data: settingsData,
    isLoading: isLoading || appSettings.isLoading,
    error,
  };
};

/**
 * Custom hook for managing blog data with pagination and filtering
 */
export const useBlogs = (options?: {
  category?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
  autoRefetch?: boolean;
}) => {
  const dispatch = useAppDispatch();
  const { category, featured = false, page = 1, limit = 10, autoRefetch = false } = options || {};

  // Determine which query to use based on options
  const queryOptions = useMemo(
    () => ({
      page,
      limit,
      category,
      refetchOnMountOrArgChange: autoRefetch ? 30 : false,
      refetchOnFocus: autoRefetch,
    }),
    [page, limit, category, autoRefetch],
  );

  const {
    data: blogsData,
    isLoading: blogsLoading,
    error: blogsError,
    refetch: refetchBlogs,
  } = useGetBlogsQuery(featured ? { ...queryOptions, isFeatured: true } : queryOptions);

  const {
    data: featuredData,
    isLoading: featuredLoading,
    error: featuredError,
  } = useGetFeaturedBlogsQuery(
    { page: 1, limit: 5 },
    {
      skip: !featured,
      refetchOnMountOrArgChange: autoRefetch ? 30 : false,
    },
  );

  useEffect(() => {
    if (blogsError) {
      dispatch(showError('Failed to load blogs'));
    }
    if (featuredError) {
      dispatch(showError('Failed to load featured blogs'));
    }
  }, [blogsError, featuredError, dispatch]);

  return {
    blogs: blogsData?.results || [],
    featuredBlogs: featuredData?.results || [],
    pagination: {
      currentPage: blogsData?.page || 1,
      totalPages: blogsData?.totalPages || 1,
      totalResults: blogsData?.totalResults || 0,
    },
    isLoading: blogsLoading || featuredLoading,
    error: blogsError || featuredError,
    refetch: refetchBlogs,
  };
};

/**
 * Custom hook for managing UI state and common UI operations
 */
export const useUI = () => {
  const dispatch = useAppDispatch();
  const ui = useAppSelector((state) => state.ui);

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    dispatch({
      type: 'ui/addNotification',
      payload: {
        message,
        type,
        autoHide: true,
        duration: 5000,
      },
    });
  };

  const openModal = (modalKey: keyof typeof ui.modals) => {
    dispatch({ type: 'ui/openModal', payload: modalKey });
  };

  const closeModal = (modalKey: keyof typeof ui.modals) => {
    dispatch({ type: 'ui/closeModal', payload: modalKey });
  };

  const toggleSidebar = () => {
    dispatch({ type: 'ui/toggleSidebar' });
  };

  const setFilter = (key: string, value: any) => {
    dispatch({ type: 'ui/setActiveFilter', payload: { key, value } });
  };

  const clearFilters = () => {
    dispatch({ type: 'ui/clearFilters' });
  };

  const selectItems = (itemIds: string[]) => {
    dispatch({ type: 'ui/selectAllItems', payload: itemIds });
  };

  const toggleItemSelection = (itemId: string) => {
    dispatch({ type: 'ui/toggleItemSelection', payload: itemId });
  };

  return {
    ...ui,
    showNotification,
    openModal,
    closeModal,
    toggleSidebar,
    setFilter,
    clearFilters,
    selectItems,
    toggleItemSelection,
  };
};

/**
 * Custom hook for theme management
 */
export const useTheme = () => {
  const dispatch = useAppDispatch();
  const { themeMode } = useAppSelector((state) => state.appSettings);

  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    dispatch({ type: 'appSettings/setThemeMode', payload: newMode });
    localStorage.setItem('themeMode', newMode);
  };

  const setTheme = (mode: 'light' | 'dark') => {
    dispatch({ type: 'appSettings/setThemeMode', payload: mode });
    localStorage.setItem('themeMode', mode);
  };

  return {
    themeMode,
    isDark: themeMode === 'dark',
    isLight: themeMode === 'light',
    toggleTheme,
    setTheme,
  };
};

/**
 * Custom hook for local storage synchronization
 */
export const useLocalStorage = <T>(key: string, defaultValue: T) => {
  const storedValue = useMemo(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  }, [key, defaultValue]);

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      localStorage.setItem(key, JSON.stringify(valueToStore));
      // Could dispatch an action to update global state if needed
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
};

/**
 * Custom hook for debounced values
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
