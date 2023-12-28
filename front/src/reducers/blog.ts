import {
  GET_BLOGS_SUCCESS,
  GET_DRAFTS_SUCCESS,
  GET_BLOG_SUCCESS,
  GET_FEATURED_BLOGS_SUCCESS,
  GET_BLOG_VIEWS_SUCCESS,
  GENERATE_BLOG_SUCCESS,
  UPDATE_BLOG_SUCCESS,
  DELETE_BLOG_SUCCESS,
  SET_BLOGS_LOADING_STATUS,
  Action,
  CLEAR_BLOG,
} from '../utils/consts';

export type IBlog = {
  id: string;
  title: string;
  topic: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  author: {
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
  languageModel: string;
  tone: string;
  createdAt: Date;
};

interface IQueryResult {
  page: number;
  totalPages: number;
  totalResults: number;
  results: IBlog[];
}

interface BlogReducer {
  blogData: IBlog | null;
  featuredBlogs: IQueryResult;
  allBlogs: IQueryResult;
  views: number[];
  drafts: IQueryResult;
  loading: boolean;
}

const initialState: BlogReducer = {
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
};

const blogReducer = (state = initialState, action: Action) => {
  const { type, payload } = action;
  switch (type) {
    case GENERATE_BLOG_SUCCESS:
    case GET_BLOG_SUCCESS:
      return {
        ...state,
        blogData: payload,
      };
    case GET_BLOG_VIEWS_SUCCESS:
      return {
        ...state,
        views: payload,
      };
    case GET_DRAFTS_SUCCESS:
      return {
        ...state,
        drafts: payload,
      };
    case UPDATE_BLOG_SUCCESS:
      return {
        ...state,
        blogData: {...state.blogData, ...payload},
      };
    case GET_BLOGS_SUCCESS:
      return {
        ...state,
        allBlogs: payload,
      };
    case GET_FEATURED_BLOGS_SUCCESS:
      return {
        ...state,
        featuredBlogs: payload,
      };
    case DELETE_BLOG_SUCCESS:
      return {
        ...state,
        allBlogs: state.allBlogs!.results!.filter((blog) => blog.id !== payload),
      };
    case CLEAR_BLOG:
      return {
        ...state,
        blogData: null,
      };
    case SET_BLOGS_LOADING_STATUS:
      return {
        ...state,
        loading: !state.loading,
      };
    default:
      return state;
  }
};

export default blogReducer;
