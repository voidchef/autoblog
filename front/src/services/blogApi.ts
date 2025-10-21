import { api } from './api';

export interface IBlogData {
  topic: string;
  country?: string;
  intent?: string;
  audience?: string;
  language: string;
  llmModel: string;
  category: string;
  tags?: string;
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
    avatar: string;
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
  generatedImages?: string[];
  selectedImage?: string;
  audioNarrationUrl?: string;
  audioGenerationStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  likes: string[];
  dislikes: string[];
  createdAt: Date;
  updatedAt: Date;
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
      invalidatesTags: ['Blog'],
    }),

    getAudioNarrationStatus: builder.query<{ audioNarrationUrl?: string; audioGenerationStatus?: string }, string>({
      query: (blogId) => `/blogs/${blogId}/audio`,
      providesTags: ['Blog'],
    }),
  }),
});

export const {
  useGenerateBlogMutation,
  useCreateBlogMutation,
  useGetBlogsQuery,
  useGetFeaturedBlogsQuery,
  useGetDraftBlogsQuery,
  useGetBlogsByCategoryQuery,
  useGetBlogQuery,
  useGetBlogBySlugQuery,
  useGetBlogViewsQuery,
  useGetAllBlogsEngagementStatsQuery,
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
} = blogApi;
