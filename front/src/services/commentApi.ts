import { api } from './api';

export interface IComment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    email?: string;
  };
  blog: string;
  parentComment?: string;
  likes: string[];
  dislikes: string[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommentQueryResult {
  page: number;
  totalPages: number;
  totalResults: number;
  results: IComment[];
}

export interface CreateCommentData {
  content: string;
  blog: string;
  parentComment?: string;
}

export interface UpdateCommentData {
  content: string;
}

export interface CommentsQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  blog?: string;
  author?: string;
  parentComment?: string;
}

export const commentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new comment
    createComment: builder.mutation<IComment, CreateCommentData>({
      query: (commentData) => ({
        url: '/comments/',
        method: 'POST',
        body: commentData,
      }),
      invalidatesTags: (result, error, { blog, parentComment }) => [
        { type: 'Comment', id: 'LIST' },
        { type: 'Comment', id: `BLOG_${blog}` },
        ...(parentComment ? [{ type: 'Comment' as const, id: `REPLIES_${parentComment}` }] : []),
      ],
      transformErrorResponse: (response: { status: number; data: any }) => {
        return response.data?.message || 'Comment creation failed';
      },
    }),

    // Get all comments with filters
    getComments: builder.query<ICommentQueryResult, CommentsQueryParams>({
      query: (params) => ({
        url: '/comments/',
        params,
      }),
      providesTags: (result) =>
        result
          ? [...result.results.map(({ id }) => ({ type: 'Comment' as const, id })), { type: 'Comment', id: 'LIST' }]
          : [{ type: 'Comment', id: 'LIST' }],
      keepUnusedDataFor: 300, // Keep data for 5 minutes
    }),

    // Get comments for a specific blog post
    getCommentsByBlog: builder.query<ICommentQueryResult, { blogId: string; page?: number; limit?: number; sortBy?: string }>({
      query: ({ blogId, ...params }) => ({
        url: `/comments/blog/${blogId}`,
        params,
      }),
      providesTags: (result, error, { blogId }) => [
        { type: 'Comment', id: `BLOG_${blogId}` },
        ...(result ? result.results.map(({ id }) => ({ type: 'Comment' as const, id })) : []),
      ],
      keepUnusedDataFor: 300,
    }),

    // Get a single comment by ID
    getComment: builder.query<IComment, string>({
      query: (commentId) => `/comments/${commentId}`,
      providesTags: (result, error, commentId) => [{ type: 'Comment', id: commentId }],
      keepUnusedDataFor: 300,
    }),

    // Get replies to a comment
    getReplies: builder.query<ICommentQueryResult, { commentId: string; page?: number; limit?: number; sortBy?: string }>({
      query: ({ commentId, ...params }) => ({
        url: `/comments/${commentId}/replies`,
        params,
      }),
      providesTags: (result, error, { commentId }) => [
        { type: 'Comment', id: `REPLIES_${commentId}` },
        ...(result ? result.results.map(({ id }) => ({ type: 'Comment' as const, id })) : []),
      ],
      keepUnusedDataFor: 300,
    }),

    // Update a comment
    updateComment: builder.mutation<IComment, { id: string; data: UpdateCommentData }>({
      query: ({ id, data }) => ({
        url: `/comments/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Comment', id },
        { type: 'Comment', id: 'LIST' },
      ],
      onQueryStarted: async ({ id }, { dispatch, queryFulfilled }) => {
        try {
          const { data: updatedComment } = await queryFulfilled;
          // Optimistically update the cache
          dispatch(
            commentApi.util.updateQueryData('getComment', id, (draft) => {
              Object.assign(draft, updatedComment);
            }),
          );
        } catch {}
      },
    }),

    // Delete a comment
    deleteComment: builder.mutation<void, string>({
      query: (commentId) => ({
        url: `/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, commentId) => [
        { type: 'Comment', id: commentId },
        { type: 'Comment', id: 'LIST' },
      ],
    }),

    // Like a comment
    likeComment: builder.mutation<IComment, string>({
      query: (commentId) => ({
        url: `/comments/${commentId}/like`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, commentId) => [{ type: 'Comment', id: commentId }],
      // Optimistic update for better UX
      onQueryStarted: async (commentId, { dispatch, queryFulfilled, getState }) => {
        const state = getState() as any;
        const userId = state.auth.userId;

        // Optimistically update the comment cache
        const patchResult = dispatch(
          commentApi.util.updateQueryData('getComment', commentId, (draft) => {
            if (userId) {
              const likeIndex = draft.likes.indexOf(userId);
              const dislikeIndex = draft.dislikes.indexOf(userId);

              if (likeIndex > -1) {
                // Unlike
                draft.likes.splice(likeIndex, 1);
              } else {
                // Like and remove from dislikes if present
                draft.likes.push(userId);
                if (dislikeIndex > -1) {
                  draft.dislikes.splice(dislikeIndex, 1);
                }
              }
            }
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert on error
          patchResult.undo();
        }
      },
    }),

    // Dislike a comment
    dislikeComment: builder.mutation<IComment, string>({
      query: (commentId) => ({
        url: `/comments/${commentId}/dislike`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, commentId) => [{ type: 'Comment', id: commentId }],
      // Optimistic update for better UX
      onQueryStarted: async (commentId, { dispatch, queryFulfilled, getState }) => {
        const state = getState() as any;
        const userId = state.auth.userId;

        // Optimistically update the comment cache
        const patchResult = dispatch(
          commentApi.util.updateQueryData('getComment', commentId, (draft) => {
            if (userId) {
              const likeIndex = draft.likes.indexOf(userId);
              const dislikeIndex = draft.dislikes.indexOf(userId);

              if (dislikeIndex > -1) {
                // Remove dislike
                draft.dislikes.splice(dislikeIndex, 1);
              } else {
                // Dislike and remove from likes if present
                draft.dislikes.push(userId);
                if (likeIndex > -1) {
                  draft.likes.splice(likeIndex, 1);
                }
              }
            }
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert on error
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useCreateCommentMutation,
  useGetCommentsQuery,
  useGetCommentsByBlogQuery,
  useGetCommentQuery,
  useGetRepliesQuery,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useLikeCommentMutation,
  useDislikeCommentMutation,
  useLazyGetCommentsQuery,
  useLazyGetCommentsByBlogQuery,
  useLazyGetCommentQuery,
  useLazyGetRepliesQuery,
} = commentApi;
