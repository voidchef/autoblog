/**
 * Google Analytics 4 Utility Module
 * 
 * This module provides a robust implementation for Google Analytics tracking with:
 * - Proper initialization with error handling
 * - Environment-based configuration (debug mode in development)
 * - User identification for authenticated users
 * - Page view tracking with metadata
 * - Custom event tracking for user interactions
 * - Content grouping for better analytics insights
 * - Web Vitals performance tracking
 */

import ReactGA from 'react-ga4';

// Track initialization state to prevent multiple initializations
let isInitialized = false;

/**
 * Initialize Google Analytics 4
 * Should be called once when the app starts
 * 
 * @param measurementId - GA4 Measurement ID (e.g., G-XXXXXXXXXX)
 * @param options - Optional configuration options
 */
export const initializeGA = (
  measurementId: string | undefined,
  options?: {
    debug?: boolean;
    testMode?: boolean;
  }
): boolean => {
  // Prevent multiple initializations
  if (isInitialized) {
    console.warn('[Analytics] Google Analytics already initialized');
    return true;
  }

  // Validate measurement ID
  if (!measurementId || measurementId === 'example-ga-id') {
    console.warn('[Analytics] Google Analytics not initialized: Invalid or missing measurement ID');
    return false;
  }

  try {
    // Initialize ReactGA with options
    ReactGA.initialize(measurementId, {
      gaOptions: {
        // Enable debug mode in development
        debug_mode: options?.debug ?? import.meta.env.DEV,
        // Anonymize IP for privacy compliance
        anonymize_ip: true,
      },
      // Test mode prevents sending data to GA (useful for testing)
      testMode: options?.testMode ?? false,
    });

    isInitialized = true;
    console.log('[Analytics] Google Analytics initialized successfully');
    return true;
  } catch (error) {
    console.error('[Analytics] Failed to initialize Google Analytics:', error);
    return false;
  }
};

/**
 * Check if Google Analytics is initialized and ready to use
 */
export const isGAInitialized = (): boolean => {
  return isInitialized;
};

/**
 * Set user ID for tracking authenticated users
 * Helps track user journeys across sessions
 * 
 * @param userId - Unique user identifier
 */
export const setUserID = (userId: string | null): void => {
  if (!isInitialized) return;

  try {
    if (userId) {
      ReactGA.set({ userId });
      console.log('[Analytics] User ID set');
    } else {
      // Clear user ID on logout
      ReactGA.set({ userId: undefined });
      console.log('[Analytics] User ID cleared');
    }
  } catch (error) {
    console.error('[Analytics] Failed to set user ID:', error);
  }
};

/**
 * Track page views with enhanced metadata
 * 
 * @param path - Page path (e.g., /blog/my-post)
 * @param title - Page title
 * @param additionalParams - Additional tracking parameters
 */
export const trackPageView = (
  path: string,
  title?: string,
  additionalParams?: Record<string, any>
): void => {
  if (!isInitialized) return;

  try {
    ReactGA.send({
      hitType: 'pageview',
      page: path,
      title: title || document.title,
      ...additionalParams,
    });

    if (import.meta.env.DEV) {
      console.log('[Analytics] Page view tracked:', { path, title });
    }
  } catch (error) {
    console.error('[Analytics] Failed to track page view:', error);
  }
};

/**
 * Content categories for grouping analytics data
 */
export enum ContentCategory {
  BLOG = 'blog',
  DASHBOARD = 'dashboard',
  PROFILE = 'profile',
  AUTH = 'auth',
  HOME = 'home',
  CATEGORY = 'category',
  AUTHOR = 'author',
  CONTACT = 'contact',
  ABOUT = 'about',
}

/**
 * Track custom events with parameters
 * 
 * @param eventName - Name of the event
 * @param eventParams - Event parameters
 */
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
): void => {
  if (!isInitialized) return;

  try {
    ReactGA.event(eventName, eventParams);

    if (import.meta.env.DEV) {
      console.log('[Analytics] Event tracked:', eventName, eventParams);
    }
  } catch (error) {
    console.error('[Analytics] Failed to track event:', error);
  }
};

/**
 * Predefined event tracking functions for common user interactions
 */

// Blog interaction events
export const trackBlogView = (blogId: string, blogTitle: string, category?: string): void => {
  trackEvent('blog_view', {
    blog_id: blogId,
    blog_title: blogTitle,
    blog_category: category || 'uncategorized',
    content_type: 'blog_post',
  });
};

export const trackBlogLike = (blogId: string, blogTitle: string, category?: string): void => {
  trackEvent('blog_like', {
    blog_id: blogId,
    blog_title: blogTitle,
    blog_category: category || 'uncategorized',
    engagement_type: 'like',
  });
};

export const trackBlogDislike = (blogId: string, blogTitle: string, category?: string): void => {
  trackEvent('blog_dislike', {
    blog_id: blogId,
    blog_title: blogTitle,
    blog_category: category || 'uncategorized',
    engagement_type: 'dislike',
  });
};

export const trackBlogComment = (blogId: string, blogTitle: string, category?: string): void => {
  trackEvent('blog_comment', {
    blog_id: blogId,
    blog_title: blogTitle,
    blog_category: category || 'uncategorized',
    engagement_type: 'comment',
  });
};

export const trackBlogShare = (
  blogId: string,
  blogTitle: string,
  platform: string,
  category?: string
): void => {
  trackEvent('blog_share', {
    blog_id: blogId,
    blog_title: blogTitle,
    blog_category: category || 'uncategorized',
    platform: platform, // twitter, facebook, linkedin, email, copy_link
    content_type: 'blog_post',
  });
};

// Audio player events
export const trackAudioPlay = (blogId: string, blogTitle: string, category?: string): void => {
  trackEvent('audio_play', {
    blog_id: blogId,
    blog_title: blogTitle,
    blog_category: category || 'uncategorized',
    content_type: 'audio',
  });
};

export const trackAudioGenerate = (blogId: string, blogTitle: string, category?: string): void => {
  trackEvent('audio_generate', {
    blog_id: blogId,
    blog_title: blogTitle,
    blog_category: category || 'uncategorized',
    action_type: 'generate',
  });
};

export const trackAudioComplete = (blogId: string, blogTitle: string, duration: number, category?: string): void => {
  trackEvent('audio_complete', {
    blog_id: blogId,
    blog_title: blogTitle,
    blog_category: category || 'uncategorized',
    duration: duration,
    engagement_type: 'audio_completion',
  });
};

// Search and filter events
export const trackSearch = (searchQuery: string, resultsCount: number): void => {
  trackEvent('search', {
    search_term: searchQuery,
    results_count: resultsCount,
  });
};

export const trackCategoryView = (category: string): void => {
  trackEvent('view_item_list', {
    item_list_name: category,
    item_category: category,
  });
};

// User actions
export const trackSignUp = (method: string): void => {
  trackEvent('sign_up', {
    method: method, // e.g., 'email', 'google', 'github'
  });
};

export const trackLogin = (method: string): void => {
  trackEvent('login', {
    method: method,
  });
};

export const trackLogout = (): void => {
  trackEvent('logout', {});
};

// Content creation events
export const trackBlogCreate = (category?: string): void => {
  trackEvent('blog_create', {
    content_type: 'blog_post',
    category: category,
  });
};

export const trackBlogPublish = (blogId: string, category?: string): void => {
  trackEvent('blog_publish', {
    blog_id: blogId,
    content_type: 'blog_post',
    category: category,
  });
};

export const trackBlogEdit = (blogId: string): void => {
  trackEvent('blog_edit', {
    blog_id: blogId,
    content_type: 'blog_post',
  });
};

export const trackBlogDelete = (blogId: string): void => {
  trackEvent('blog_delete', {
    blog_id: blogId,
    content_type: 'blog_post',
  });
};

// Contact and engagement events
export const trackContactSubmit = (): void => {
  trackEvent('contact_submit', {
    form_type: 'contact',
  });
};

export const trackOAuthConnection = (provider: string, action: 'connect' | 'disconnect'): void => {
  trackEvent('oauth_connection', {
    provider: provider, // e.g., 'medium', 'blogger'
    action: action,
  });
};

// Error tracking
export const trackError = (errorType: string, errorMessage: string, location?: string): void => {
  trackEvent('exception', {
    description: `${errorType}: ${errorMessage}`,
    fatal: false,
    location: location,
  });
};

/**
 * Track Web Vitals for performance monitoring
 * Integrate with web-vitals library if needed
 * 
 * @param metric - Web Vitals metric object
 */
export const trackWebVitals = (metric: {
  name: string;
  value: number;
  id: string;
  delta: number;
}): void => {
  if (!isInitialized) return;

  try {
    // Send Web Vitals as events
    trackEvent('web_vitals', {
      event_category: 'Web Vitals',
      event_label: metric.name,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
      non_interaction: true,
    });
  } catch (error) {
    console.error('[Analytics] Failed to track Web Vitals:', error);
  }
};

/**
 * Track timing for performance monitoring
 * 
 * @param category - Timing category (e.g., 'Page Load', 'API Call')
 * @param variable - Timing variable name (e.g., 'Initial Load', 'Fetch Posts')
 * @param value - Time in milliseconds
 * @param label - Optional label for additional context
 */
export const trackTiming = (
  category: string,
  variable: string,
  value: number,
  label?: string
): void => {
  if (!isInitialized) return;

  try {
    trackEvent('timing_complete', {
      name: variable,
      value: Math.round(value),
      event_category: category,
      event_label: label,
    });
  } catch (error) {
    console.error('[Analytics] Failed to track timing:', error);
  }
};

/**
 * Clear user data (on logout or for privacy)
 */
export const clearUserData = (): void => {
  setUserID(null);
};

export default {
  initialize: initializeGA,
  isInitialized: isGAInitialized,
  setUserID,
  trackPageView,
  trackEvent,
  // Blog interactions
  trackBlogView,
  trackBlogLike,
  trackBlogDislike,
  trackBlogComment,
  trackBlogShare,
  // Audio
  trackAudioPlay,
  trackAudioGenerate,
  trackAudioComplete,
  // Search & navigation
  trackSearch,
  trackCategoryView,
  // User actions
  trackSignUp,
  trackLogin,
  trackLogout,
  // Content management
  trackBlogCreate,
  trackBlogPublish,
  trackBlogEdit,
  trackBlogDelete,
  // Other
  trackContactSubmit,
  trackOAuthConnection,
  trackError,
  trackWebVitals,
  trackTiming,
  clearUserData,
};
