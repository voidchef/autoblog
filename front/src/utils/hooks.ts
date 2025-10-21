import { useEffect, useMemo, useState } from 'react';
import { useAppSelector, useAppDispatch } from './reduxHooks';
import { useGetUserQuery } from '../services/userApi';
import { useGetAppSettingsQuery } from '../services/appSettingsApi';
import { useGetFeaturedBlogsQuery, useGetBlogsQuery } from '../services/blogApi';
import { showError } from '../reducers/alert';
import { setThemeMode } from '../reducers/appSettings';
import { REFETCH_INTERVALS } from './cacheConfig';

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
    // Only refetch if data is stale using centralized config
    refetchOnMountOrArgChange: REFETCH_INTERVALS.STALE_5_MIN,
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
    // App settings rarely change, so cache for longer periods using centralized config
    refetchOnMountOrArgChange: REFETCH_INTERVALS.STALE_30_MIN,
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
      refetchOnMountOrArgChange: autoRefetch ? REFETCH_INTERVALS.STALE_5_MIN : REFETCH_INTERVALS.NEVER,
      refetchOnFocus: false, // Disabled for better performance
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
      refetchOnMountOrArgChange: autoRefetch ? REFETCH_INTERVALS.STALE_5_MIN : REFETCH_INTERVALS.NEVER,
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
 * Custom hook for theme management
 */
export const useTheme = () => {
  const dispatch = useAppDispatch();
  const { themeMode } = useAppSelector((state) => state.appSettings);

  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    dispatch(setThemeMode(newMode));
    localStorage.setItem('themeMode', newMode);
  };

  const setTheme = (mode: 'light' | 'dark') => {
    dispatch(setThemeMode(mode));
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
