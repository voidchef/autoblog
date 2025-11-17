import { api } from './api';

export interface IBlogData {
  topic: string;
  country?: string;
  intent?: string;
  audience?: string;
  language: string;
  llmModel: string;
  llmProvider?: 'openai' | 'google' | 'mistral';
  category: string;
  tags?: string;
}

export interface ITemplateBlogData {
  template: File;
  input: Record<string, string | number | boolean>;
  llmModel: string;
  llmProvider?: 'openai' | 'google' | 'mistral';
  category: string;
  tags?: string[];
  generateImages?: boolean;
  generateHeadingImages?: boolean;
  imagesPerSection?: number;
}

export interface ITemplatePreview {
  systemPrompt: string;
  contentPromptCount: number;
  imagePromptCount: number;
  variables: string[];
}

export interface IBlog {
  id: string;
  title: string;
  topic: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  author: {
    id: string;
    name: string;
    profilePicture?: string;
  };
  readingTime: number;
  content: string;
  category: string;
  tags?: string[];
  isFeatured: boolean;
  isPublished: boolean;
  isDraft: boolean;
  country?: string;
  intent?: string;
  audience?: string;
  language: string;
  llmModel: string;
  llmProvider?: 'openai' | 'google' | 'mistral';
  generatedImages?: string[];
  selectedImage?: string;
  audioNarrationUrl?: string;
  audioGenerationStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  generationStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  generationError?: string;
  // WordPress publishing fields
  wordpressPostId?: number;
  wordpressPostUrl?: string;
  wordpressPublishStatus?: 'pending' | 'published' | 'failed';
  wordpressPublishedAt?: Date;
  // Medium publishing fields
  mediumPostId?: string;
  mediumPostUrl?: string;
  mediumPublishStatus?: 'pending' | 'published' | 'failed';
  mediumPublishedAt?: Date;
  likes: string[];
  dislikes: string[];
  createdAt: Date;
  updatedAt: Date;
  views?: number; // Added from GA when using with-stats endpoint
  commentsCount?: number; // Added from DB when using with-stats endpoint
}

export interface IQueryResult {
  page: number;
  totalPages: number;
  totalResults: number;
  results: IBlog[];
}

export interface BlogsQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  category?: string;
  author?: string;
  isPublished?: boolean;
  isDraft?: boolean;
  isFeatured?: boolean;
}

export interface BlogViewsParams {
  startDate: string;
  endDate: string;
  slug: string;
}

export interface AllBlogsEngagementStats {
  totalBlogs: number;
  totalLikes: number;
  totalDislikes: number;
  totalComments: number;
  totalEngagement: number;
  avgEngagementPerBlog: string;
}

export interface AnalyticsOverview {
  pageViews: number;
  blogViews: number;
  totalUsers: number;
  sessions: number;
  avgSessionDuration: number;
  bounceRate: number;
  engagementRate: number;
  totalBlogs: number;
  totalLikes: number;
  totalDislikes: number;
  totalComments: number;
  totalEngagement: number;
  avgEngagementPerBlog: string;
}

export interface BlogPerformance {
  id: string;
  title: string;
  slug: string;
  category: string;
  publishedAt: Date;
  views: number;
  likes: number;
  dislikes: number;
  isFeatured: boolean;
  engagementRate: string;
}

export interface TrafficSource {
  channel: string;
  source: string;
  sessions: number;
  users: number;
}

export interface DailyTrend {
  date: string;
  pageViews: number;
  users: number;
  sessions: number;
}

export interface ComprehensiveAnalytics {
  overview: AnalyticsOverview;
  blogsPerformance: BlogPerformance[];
  trafficSources: TrafficSource[];
  dailyTrends: DailyTrend[];
  topPerformers: BlogPerformance[];
}

export interface DashboardStats {
  weeklyViews: number;
  weeklyViewsChange: number;
  newFollowers: number;
  newFollowersChange: number;
  avgReadTime: number;
  avgReadTimeChange: number;
  engagementRate: number;
  engagementRateChange: number;
  totalReach: number;
  totalReachChange: number;
}

export interface EventAnalytics {
  summary: {
    totalLikes: number;
    totalShares: number;
    totalAudioPlays: number;
  };
  byBlog: Array<{
    slug: string;
    title: string;
    likes: number;
    shares: number;
    audioPlays: number;
  }>;
}

export const blogApi = api.injectEndpoints({
  endpoints: (builder) => ({
    generateBlog: builder.mutation<IBlog, IBlogData>({
      query: (blogData) => ({
        url: '/blogs/',
        method: 'POST',
        body: blogData,
      }),
      invalidatesTags: ['Blog', 'Draft'],
      transformErrorResponse: (response: { status: number; data: any }) => {
        return response.data?.message || 'Blog generation failed';
      },
    }),

    generateBlogFromTemplate: builder.mutation<IBlog, ITemplateBlogData>({
      query: ({ template, input, llmModel, llmProvider, category, tags, generateImages, generateHeadingImages, imagesPerSection }) => {
        const formData = new FormData();
        formData.append('template', template);
        formData.append('input', JSON.stringify(input));
        formData.append('llmModel', llmModel);
        if (llmProvider) formData.append('llmProvider', llmProvider);
        formData.append('category', category);
        if (tags) formData.append('tags', JSON.stringify(tags));
        if (generateImages !== undefined) formData.append('generateImages', String(generateImages));
        if (generateHeadingImages !== undefined) formData.append('generateHeadingImages', String(generateHeadingImages));
        if (imagesPerSection !== undefined) formData.append('imagesPerSection', String(imagesPerSection));

        return {
          url: '/blogs/generate-from-template',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Blog', 'Draft'],
      transformErrorResponse: (response: { status: number; data: any }) => {
        return response.data?.message || 'Template blog generation failed';
      },
    }),

    getTemplatePreview: builder.mutation<ITemplatePreview, File>({
      query: (template) => {
        const formData = new FormData();
        formData.append('template', template);

        return {
          url: '/blogs/template-preview',
          method: 'POST',
          body: formData,
        };
      },
      transformErrorResponse: (response: { status: number; data: any }) => {
        return response.data?.message || 'Template preview failed';
      },
    }),

    createBlog: builder.mutation<IBlog, Partial<IBlog>>({
      query: (blogData) => ({
        url: '/blogs/create',
        method: 'POST',
        body: blogData,
      }),
      invalidatesTags: ['Blog', 'Draft'],
      transformErrorResponse: (response: { status: number; data: any }) => {
        return response.data?.message || 'Blog creation failed';
      },
    }),

    getBlogs: builder.query<IQueryResult, BlogsQueryParams>({
      query: (params) => ({
        url: '/blogs/',
        params: {
          ...params,
          populate: 'author',
        },
      }),
      providesTags: (result) =>
        result
          ? [...result.results.map(({ id }) => ({ type: 'Blog' as const, id })), { type: 'Blog', id: 'LIST' }]
          : [{ type: 'Blog', id: 'LIST' }],
      keepUnusedDataFor: 300, // Keep data for 5 minutes
    }),

    getBlogsWithStats: builder.query<IQueryResult, BlogsQueryParams>({
      query: (params) => ({
        url: '/blogs/with-stats',
        params: {
          ...params,
          populate: 'author',
        },
      }),
      providesTags: (result) =>
        result
          ? [...result.results.map(({ id }) => ({ type: 'Blog' as const, id })), { type: 'Blog', id: 'WITH_STATS' }]
          : [{ type: 'Blog', id: 'WITH_STATS' }],
      keepUnusedDataFor: 300, // Keep data for 5 minutes
    }),

    getFeaturedBlogs: builder.query<IQueryResult, { page?: number; limit?: number }>({
      query: (params) => ({
        url: '/blogs/',
        params: { 
          ...params, 
          isFeatured: true,
          populate: 'author',
        },
      }),
      providesTags: [{ type: 'Blog', id: 'FEATURED' }],
      keepUnusedDataFor: 600, // Keep featured blogs for 10 minutes
    }),

    getDraftBlogs: builder.query<IQueryResult, BlogsQueryParams>({
      query: (params) => ({
        url: '/blogs/',
        params: { 
          ...params, 
          isDraft: true,
          populate: 'author',
        },
      }),
      providesTags: (result) =>
        result
          ? [...result.results.map(({ id }) => ({ type: 'Draft' as const, id })), { type: 'Draft', id: 'LIST' }]
          : [{ type: 'Draft', id: 'LIST' }],
    }),

    getBlogsByCategory: builder.query<IQueryResult, { category: string; page?: number; limit?: number }>({
      query: ({ category, ...params }) => ({
        url: '/blogs/',
        params: { 
          ...params, 
          category, 
          isPublished: true,
          populate: 'author',
        },
      }),
      providesTags: (result, error, { category }) => [{ type: 'Blog', id: `CATEGORY_${category}` }],
      keepUnusedDataFor: 300,
    }),

    getBlog: builder.query<IBlog, string>({
      query: (blogId) => `/blogs/${blogId}`,
      providesTags: (result, error, blogId) => [{ type: 'Blog', id: blogId }],
      keepUnusedDataFor: 600, // Keep individual blog posts for 10 minutes
    }),

    getBlogGenerationStatus: builder.query<
      { id: string; generationStatus: string; generationError?: string; title: string; slug: string },
      string
    >({
      query: (blogId) => `/blogs/${blogId}/generation-status`,
      providesTags: (result, error, blogId) => [{ type: 'Blog', id: blogId }],
    }),

    getBlogBySlug: builder.query<IBlog, string>({
      query: (slug) => `/blogs/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Blog', id: `SLUG_${slug}` }],
      keepUnusedDataFor: 600,
    }),

    getBlogViews: builder.query<number[], BlogViewsParams>({
      query: (params) => ({
        url: '/blogs/views',
        params,
      }),
      transformResponse: (response: any, meta, arg) => {
        const { rows } = response;
        const daysInMonth = Number(arg.endDate.substring(8, 10));
        const viewsArray = new Array(daysInMonth).fill(null);

        rows.forEach((row: any) => {
          const dateString = row.dimensionValues[0].value;
          const day = parseInt(dateString.substring(6, 8), 10);
          viewsArray[day - 1] = parseInt(row.metricValues[0].value, 10);
        });

        return viewsArray;
      },
      keepUnusedDataFor: 3600, // Keep analytics data for 1 hour
    }),

    getAllBlogsEngagementStats: builder.query<AllBlogsEngagementStats, void>({
      query: () => '/blogs/my-engagement-stats',
      providesTags: [{ type: 'Blog', id: 'MY_ENGAGEMENT' }],
      keepUnusedDataFor: 600, // Keep engagement data for 10 minutes
    }),

    getComprehensiveAnalytics: builder.query<ComprehensiveAnalytics, { startDate: string; endDate: string }>({
      query: ({ startDate, endDate }) => ({
        url: '/blogs/analytics/comprehensive',
        params: { startDate, endDate },
      }),
      keepUnusedDataFor: 3600, // Cache for 1 hour
    }),

    getAnalyticsByTimeRange: builder.query<ComprehensiveAnalytics, string>({
      query: (timeRange = '30d') => ({
        url: '/blogs/analytics/overview',
        params: { timeRange },
      }),
      keepUnusedDataFor: 1800, // Cache for 30 minutes
    }),

    getEventBasedAnalytics: builder.query<EventAnalytics, { startDate: string; endDate: string }>({
      query: ({ startDate, endDate }) => ({
        url: '/blogs/analytics/events',
        params: { startDate, endDate },
      }),
      keepUnusedDataFor: 3600, // Cache for 1 hour
    }),

    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => '/blogs/dashboard-stats',
      providesTags: [{ type: 'Blog', id: 'DASHBOARD_STATS' }],
      keepUnusedDataFor: 600, // Cache for 10 minutes
    }),

    updateBlog: builder.mutation<IBlog, { id: string; data: Partial<IBlog>; preview?: boolean }>({
      query: ({ id, data, preview = false }) => ({
        url: `/blogs/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Blog', id },
        { type: 'Blog', id: 'LIST' },
        { type: 'Blog', id: 'FEATURED' },
        { type: 'Draft', id },
        { type: 'Draft', id: 'LIST' },
      ],
      onQueryStarted: async ({ id }, { dispatch, queryFulfilled }) => {
        try {
          const { data: updatedBlog } = await queryFulfilled;
          // Optimistically update the cache
          dispatch(
            blogApi.util.updateQueryData('getBlog', id, (draft) => {
              Object.assign(draft, updatedBlog);
            }),
          );
        } catch {}
      },
    }),

    publishBlog: builder.mutation<IBlog, string>({
      query: (blogId) => ({
        url: `/blogs/${blogId}/publish`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, blogId) => [
        { type: 'Blog', id: blogId },
        { type: 'Blog', id: 'LIST' },
        { type: 'Draft', id: blogId },
        { type: 'Draft', id: 'LIST' },
      ],
    }),

    unpublishBlog: builder.mutation<IBlog, string>({
      query: (blogId) => ({
        url: `/blogs/${blogId}/unpublish`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, blogId) => [
        { type: 'Blog', id: blogId },
        { type: 'Blog', id: 'LIST' },
        { type: 'Draft', id: blogId },
        { type: 'Draft', id: 'LIST' },
      ],
    }),

    toggleFeatured: builder.mutation<IBlog, string>({
      query: (blogId) => ({
        url: `/blogs/${blogId}/toggle-featured`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, blogId) => [
        { type: 'Blog', id: blogId },
        { type: 'Blog', id: 'FEATURED' },
        { type: 'Blog', id: 'LIST' },
      ],
    }),

    deleteBlog: builder.mutation<void, string>({
      query: (blogId) => ({
        url: `/blogs/${blogId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, blogId) => [
        { type: 'Blog', id: blogId },
        { type: 'Blog', id: 'LIST' },
        { type: 'Blog', id: 'FEATURED' },
        { type: 'Draft', id: blogId },
        { type: 'Draft', id: 'LIST' },
      ],
    }),

    bulkDeleteBlogs: builder.mutation<void, string[]>({
      query: (blogIds) => ({
        url: '/blogs/bulk-delete',
        method: 'DELETE',
        body: { blogIds },
      }),
      invalidatesTags: ['Blog', 'Draft'],
    }),

    searchBlogs: builder.query<IQueryResult, { query: string; page?: number; limit?: number }>({
      query: (params) => ({
        url: '/blogs/search',
        params: {
          ...params,
          populate: 'author',
        },
      }),
      providesTags: [{ type: 'Blog', id: 'SEARCH' }],
      keepUnusedDataFor: 60, // Keep search results for 1 minute
    }),

    // Like a blog post
    likeBlog: builder.mutation<IBlog, string>({
      query: (blogId) => ({
        url: `/blogs/${blogId}/like`,
        method: 'POST',
      }),
      // Invalidate all blog-related tags to force refetch
      async onQueryStarted(blogId, { dispatch, queryFulfilled }) {
        try {
          const { data: updatedBlog } = await queryFulfilled;

          // Update the cache for getBlog query (by slug)
          dispatch(
            blogApi.util.updateQueryData('getBlog', updatedBlog.slug, (draft) => {
              draft.likes = updatedBlog.likes;
              draft.dislikes = updatedBlog.dislikes;
            }),
          );

          // Also try to update by ID
          dispatch(
            blogApi.util.updateQueryData('getBlog', updatedBlog.id, (draft) => {
              draft.likes = updatedBlog.likes;
              draft.dislikes = updatedBlog.dislikes;
            }),
          );
        } catch (error) {
          // If update fails, invalidate to trigger refetch
          console.error('Failed to update like cache:', error);
        }
      },
      invalidatesTags: ['Blog', 'Draft'],
    }),

    // Dislike a blog post
    dislikeBlog: builder.mutation<IBlog, string>({
      query: (blogId) => ({
        url: `/blogs/${blogId}/dislike`,
        method: 'POST',
      }),
      // Invalidate all blog-related tags to force refetch
      async onQueryStarted(blogId, { dispatch, queryFulfilled }) {
        try {
          const { data: updatedBlog } = await queryFulfilled;

          // Update the cache for getBlog query (by slug)
          dispatch(
            blogApi.util.updateQueryData('getBlog', updatedBlog.slug, (draft) => {
              draft.likes = updatedBlog.likes;
              draft.dislikes = updatedBlog.dislikes;
            }),
          );

          // Also try to update by ID
          dispatch(
            blogApi.util.updateQueryData('getBlog', updatedBlog.id, (draft) => {
              draft.likes = updatedBlog.likes;
              draft.dislikes = updatedBlog.dislikes;
            }),
          );
        } catch (error) {
          // If update fails, invalidate to trigger refetch
          console.error('Failed to update dislike cache:', error);
        }
      },
      invalidatesTags: ['Blog', 'Draft'],
    }),

    generateAudioNarration: builder.mutation<{ message: string; audioNarrationUrl: string; audioGenerationStatus: string }, string>({
      query: (blogId) => ({
        url: `/blogs/${blogId}/audio`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, blogId) => [{ type: 'Blog', id: blogId }],
    }),

    getAudioNarrationStatus: builder.query<{ audioNarrationUrl?: string; audioGenerationStatus?: string }, string>({
      query: (blogId) => `/blogs/${blogId}/audio`,
      providesTags: (result, error, blogId) => [{ type: 'Blog', id: blogId }],
    }),

    publishToWordPress: builder.mutation<IBlog, { blogId: string; wordpressConfig?: { siteUrl: string; username: string; applicationPassword: string } }>({
      query: ({ blogId, wordpressConfig }) => ({
        url: `/blogs/${blogId}/publish-wordpress`,
        method: 'POST',
        body: { wordpressConfig },
      }),
      invalidatesTags: ['Blog'],
    }),

    publishToMedium: builder.mutation<IBlog, { blogId: string; mediumConfig?: { integrationToken: string } }>({
      query: ({ blogId, mediumConfig }) => ({
        url: `/blogs/${blogId}/publish-medium`,
        method: 'POST',
        body: { mediumConfig },
      }),
      invalidatesTags: ['Blog'],
    }),

    regenerateText: builder.mutation<
      { regeneratedText: string },
      {
        blogId: string;
        selectedText: string;
        userPrompt: string;
        llmModel?: string;
        llmProvider?: 'openai' | 'google' | 'mistral';
        contextBefore?: string;
        contextAfter?: string;
      }
    >({
      query: (data) => ({
        url: '/blogs/regenerate-text',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGenerateBlogMutation,
  useGenerateBlogFromTemplateMutation,
  useGetTemplatePreviewMutation,
  useCreateBlogMutation,
  useGetBlogsQuery,
  useGetBlogsWithStatsQuery,
  useGetFeaturedBlogsQuery,
  useGetDraftBlogsQuery,
  useGetBlogsByCategoryQuery,
  useGetBlogQuery,
  useGetBlogGenerationStatusQuery,
  useGetBlogBySlugQuery,
  useGetBlogViewsQuery,
  useGetAllBlogsEngagementStatsQuery,
  useGetComprehensiveAnalyticsQuery,
  useGetAnalyticsByTimeRangeQuery,
  useGetEventBasedAnalyticsQuery,
  useGetDashboardStatsQuery,
  useUpdateBlogMutation,
  usePublishBlogMutation,
  useUnpublishBlogMutation,
  useToggleFeaturedMutation,
  useDeleteBlogMutation,
  useBulkDeleteBlogsMutation,
  useSearchBlogsQuery,
  useLikeBlogMutation,
  useDislikeBlogMutation,
  useLazyGetBlogsQuery,
  useLazyGetBlogsWithStatsQuery,
  useLazyGetFeaturedBlogsQuery,
  useLazyGetDraftBlogsQuery,
  useLazyGetBlogsByCategoryQuery,
  useLazyGetBlogQuery,
  useLazyGetBlogBySlugQuery,
  useLazyGetBlogViewsQuery,
  useLazySearchBlogsQuery,
  useGenerateAudioNarrationMutation,
  useGetAudioNarrationStatusQuery,
  useLazyGetAudioNarrationStatusQuery,
  usePublishToWordPressMutation,
  usePublishToMediumMutation,
  useRegenerateTextMutation,
} = blogApi;
