/**
 * Centralized cache configuration for RTK Query
 * This helps manage cache times consistently across the application
 */

export const CACHE_TIMES = {
  // User data - moderate caching since it can change
  USER_DATA: 300, // 5 minutes

  // App settings - long caching since they rarely change
  APP_SETTINGS: 1800, // 30 minutes

  // Blog content - varies by type
  BLOG_LIST: 300, // 5 minutes
  BLOG_DETAIL: 600, // 10 minutes
  FEATURED_BLOGS: 600, // 10 minutes
  BLOG_ANALYTICS: 3600, // 1 hour

  // Dashboard - moderate caching
  DASHBOARD: 600, // 10 minutes

  // Search results - short caching
  SEARCH_RESULTS: 60, // 1 minute

  // Categories - long caching
  CATEGORIES: 1800, // 30 minutes
} as const;

export const REFETCH_INTERVALS = {
  // Conservative refetch policies to prevent excessive API calls
  NEVER: false,
  STALE_5_MIN: 300,
  STALE_15_MIN: 900,
  STALE_30_MIN: 1800,
  STALE_1_HOUR: 3600,
} as const;

/**
 * Default query options for different data types
 */
export const getQueryOptions = (dataType: keyof typeof CACHE_TIMES) => ({
  keepUnusedDataFor: CACHE_TIMES[dataType],
  refetchOnFocus: false,
  refetchOnReconnect: false,
});

/**
 * Conservative query options for frequently accessed data
 */
export const conservativeQueryOptions = {
  refetchOnMountOrArgChange: REFETCH_INTERVALS.STALE_15_MIN,
  refetchOnFocus: false,
  refetchOnReconnect: false,
};

/**
 * Aggressive query options for data that changes frequently
 */
export const aggressiveQueryOptions = {
  refetchOnMountOrArgChange: REFETCH_INTERVALS.STALE_5_MIN,
  refetchOnFocus: false,
  refetchOnReconnect: false,
};
