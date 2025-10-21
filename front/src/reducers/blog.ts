import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { blogApi } from '../services/blogApi';

export type IBlog = {
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
  likes: string[];
  dislikes: string[];
  createdAt: Date;
  updatedAt: Date;
};

interface IQueryResult {
  page: number;
  totalPages: number;
  totalResults: number;
  results: IBlog[];
}

interface BlogState {
  blogData: IBlog | null;
  featuredBlogs: IQueryResult;
  allBlogs: IQueryResult;
  views: number[];
  drafts: IQueryResult;
  loading: boolean;
  error: string | null;
  selectedBlogs: string[];
  generationProgress: {
    isGenerating: boolean;
    progress: number;
    status: string;
  };
  filters: {
    category: string;
    language: string;
    isPublished?: boolean;
    isFeatured?: boolean;
    search: string;
  };
}

const initialState: BlogState = {
  blogData: null,
  featuredBlogs: {
    page: 1,
    totalPages: 1,
    totalResults: 0,
    results: [],
  },
  allBlogs: {
    page: 1,
    totalPages: 1,
    totalResults: 0,
    results: [],
  },
  views: [],
  drafts: {
    page: 1,
    totalPages: 1,
    totalResults: 0,
    results: [],
  },
  loading: false,
  error: null,
  selectedBlogs: [],
  generationProgress: {
    isGenerating: false,
    progress: 0,
    status: '',
  },
  filters: {
    category: '',
    language: '',
    search: '',
  },
};

// Enhanced async thunks for complex blog operations
export const generateBlogWithProgress = createAsyncThunk(
  'blog/generateBlogWithProgress',
  async (params: any, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setGenerationProgress({ isGenerating: true, progress: 0, status: 'Starting generation...' }));

      const result = await dispatch(blogApi.endpoints.generateBlog.initiate(params));

      if ('data' in result) {
        dispatch(setGenerationProgress({ isGenerating: false, progress: 100, status: 'Complete!' }));
        return result.data;
      }

      throw new Error('Generation failed');
    } catch (error) {
      dispatch(setGenerationProgress({ isGenerating: false, progress: 0, status: 'Failed' }));
      return rejectWithValue(error instanceof Error ? error.message : 'Generation failed');
    }
  },
);

export const publishBlog = createAsyncThunk(
  'blog/publishBlog',
  async ({ id, navigate }: { id: string; navigate?: Function }, { dispatch }) => {
    const result = await dispatch(
      blogApi.endpoints.updateBlog.initiate({
        id,
        data: { isPublished: true, isDraft: false },
      }),
    );

    if ('data' in result) {
      if (navigate) {
        navigate(`/blog/${(result.data as any).slug}`);
      }
      return result.data;
    }
    throw new Error('Failed to publish blog');
  },
);

export const unpublishBlog = createAsyncThunk('blog/unpublishBlog', async (id: string, { dispatch }) => {
  const result = await dispatch(
    blogApi.endpoints.updateBlog.initiate({
      id,
      data: { isPublished: false, isDraft: true },
    }),
  );

  if ('data' in result) {
    return result.data;
  }
  throw new Error('Failed to unpublish blog');
});

export const bulkDeleteBlogs = createAsyncThunk('blog/bulkDeleteBlogs', async (blogIds: string[], { dispatch }) => {
  const deletePromises = blogIds.map((id) => dispatch(blogApi.endpoints.deleteBlog.initiate(id)));

  await Promise.all(deletePromises);
  return blogIds;
});

export const duplicateBlog = createAsyncThunk('blog/duplicateBlog', async (blog: IBlog, { dispatch }) => {
  const duplicatedBlog = {
    topic: blog.title, // Map title to topic for the API
    title: `${blog.title} (Copy)`,
    slug: `${blog.slug}-copy`,
    seoTitle: `${blog.seoTitle} (Copy)`,
    seoDescription: blog.seoDescription,
    content: blog.content,
    category: blog.category,
    tags: blog.tags,
    country: blog.country,
    intent: blog.intent,
    audience: blog.audience,
    language: blog.language,
    llmModel: blog.llmModel,
    isDraft: true,
    isPublished: false,
    createdAt: new Date(),
  };

  // Use createBlog endpoint instead of generateBlog since we already have content
  const result = await dispatch(blogApi.endpoints.createBlog.initiate(duplicatedBlog as any));

  if ('data' in result) {
    return result.data;
  }
  throw new Error('Failed to duplicate blog');
});

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    clearBlog: (state) => {
      state.blogData = null;
    },
    setBlogData: (state, action: PayloadAction<IBlog>) => {
      state.blogData = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<BlogState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        category: '',
        language: '',
        search: '',
      };
    },
    selectBlog: (state, action: PayloadAction<string>) => {
      if (!state.selectedBlogs.includes(action.payload)) {
        state.selectedBlogs.push(action.payload);
      }
    },
    deselectBlog: (state, action: PayloadAction<string>) => {
      state.selectedBlogs = state.selectedBlogs.filter((id) => id !== action.payload);
    },
    toggleBlogSelection: (state, action: PayloadAction<string>) => {
      const blogId = action.payload;
      if (state.selectedBlogs.includes(blogId)) {
        state.selectedBlogs = state.selectedBlogs.filter((id) => id !== blogId);
      } else {
        state.selectedBlogs.push(blogId);
      }
    },
    selectAllBlogs: (state) => {
      state.selectedBlogs = state.allBlogs.results.map((blog) => blog.id);
    },
    clearSelection: (state) => {
      state.selectedBlogs = [];
    },
    setGenerationProgress: (state, action: PayloadAction<Partial<BlogState['generationProgress']>>) => {
      state.generationProgress = { ...state.generationProgress, ...action.payload };
    },
    // Optimistic updates
    addBlogOptimistic: (state, action: PayloadAction<IBlog>) => {
      state.allBlogs.results.unshift(action.payload);
      state.allBlogs.totalResults += 1;
    },
    updateBlogOptimistic: (state, action: PayloadAction<IBlog>) => {
      const updateBlogInList = (list: IBlog[]) => {
        const index = list.findIndex((blog) => blog.id === action.payload.id);
        if (index !== -1) {
          list[index] = action.payload;
        }
      };

      updateBlogInList(state.allBlogs.results);
      updateBlogInList(state.featuredBlogs.results);
      updateBlogInList(state.drafts.results);

      if (state.blogData?.id === action.payload.id) {
        state.blogData = action.payload;
      }
    },
    removeBlogOptimistic: (state, action: PayloadAction<string>) => {
      const removeBlogFromList = (list: IBlog[]) => {
        return list.filter((blog) => blog.id !== action.payload);
      };

      state.allBlogs.results = removeBlogFromList(state.allBlogs.results);
      state.allBlogs.totalResults = Math.max(0, state.allBlogs.totalResults - 1);

      state.featuredBlogs.results = removeBlogFromList(state.featuredBlogs.results);
      state.featuredBlogs.totalResults = Math.max(0, state.featuredBlogs.totalResults - 1);

      state.drafts.results = removeBlogFromList(state.drafts.results);
      state.drafts.totalResults = Math.max(0, state.drafts.totalResults - 1);

      if (state.blogData?.id === action.payload) {
        state.blogData = null;
      }

      state.selectedBlogs = state.selectedBlogs.filter((id) => id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Generate blog
      .addMatcher(blogApi.endpoints.generateBlog.matchPending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(blogApi.endpoints.generateBlog.matchFulfilled, (state, action) => {
        state.loading = false;
        state.blogData = action.payload;
        state.error = null;
      })
      .addMatcher(blogApi.endpoints.generateBlog.matchRejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to generate blog';
      })
      // Get single blog
      .addMatcher(blogApi.endpoints.getBlog.matchFulfilled, (state, action) => {
        state.blogData = action.payload;
        state.error = null;
      })
      .addMatcher(blogApi.endpoints.getBlog.matchRejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch blog';
      })
      // Get blogs
      .addMatcher(blogApi.endpoints.getBlogs.matchPending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(blogApi.endpoints.getBlogs.matchFulfilled, (state, action) => {
        state.loading = false;
        // You can customize this based on query params to set different blog lists
        state.allBlogs = action.payload;
        state.error = null;
      })
      .addMatcher(blogApi.endpoints.getBlogs.matchRejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch blogs';
      })
      // Get blog views
      .addMatcher(blogApi.endpoints.getBlogViews.matchFulfilled, (state, action) => {
        state.views = action.payload;
        state.error = null;
      })
      .addMatcher(blogApi.endpoints.getBlogViews.matchRejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch blog views';
      })
      // Update blog
      .addMatcher(blogApi.endpoints.updateBlog.matchPending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(blogApi.endpoints.updateBlog.matchFulfilled, (state, action) => {
        state.loading = false;
        state.blogData = action.payload;

        // Update in lists as well
        const updateBlogInList = (list: IBlog[]) => {
          const index = list.findIndex((blog) => blog.id === action.payload.id);
          if (index !== -1) {
            list[index] = action.payload;
          }
        };

        updateBlogInList(state.allBlogs.results);
        updateBlogInList(state.featuredBlogs.results);
        updateBlogInList(state.drafts.results);

        state.error = null;
      })
      .addMatcher(blogApi.endpoints.updateBlog.matchRejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update blog';
      })
      // Delete blog
      .addMatcher(blogApi.endpoints.deleteBlog.matchPending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(blogApi.endpoints.deleteBlog.matchFulfilled, (state, action) => {
        state.loading = false;
        const blogId = action.meta.arg.originalArgs;

        state.allBlogs.results = state.allBlogs.results.filter((blog) => blog.id !== blogId);
        state.allBlogs.totalResults = Math.max(0, state.allBlogs.totalResults - 1);

        state.featuredBlogs.results = state.featuredBlogs.results.filter((blog) => blog.id !== blogId);
        state.featuredBlogs.totalResults = Math.max(0, state.featuredBlogs.totalResults - 1);

        state.drafts.results = state.drafts.results.filter((blog) => blog.id !== blogId);
        state.drafts.totalResults = Math.max(0, state.drafts.totalResults - 1);

        if (state.blogData?.id === blogId) {
          state.blogData = null;
        }

        state.selectedBlogs = state.selectedBlogs.filter((id) => id !== blogId);
        state.error = null;
      })
      .addMatcher(blogApi.endpoints.deleteBlog.matchRejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete blog';
      });
  },
});

export const {
  clearBlog,
  setBlogData,
  clearError,
  setError,
  updateFilters,
  resetFilters,
  selectBlog,
  deselectBlog,
  toggleBlogSelection,
  selectAllBlogs,
  clearSelection,
  setGenerationProgress,
  addBlogOptimistic,
  updateBlogOptimistic,
  removeBlogOptimistic,
} = blogSlice.actions;

export default blogSlice.reducer;
