import {
  GET_BLOGS_SUCCESS,
  GET_BLOG_SUCCESS,
  GET_FEATURED_BLOGS_SUCCESS,
  GET_DRAFT_SUCCESS,
  GENERATE_BLOG_SUCCESS,
  UPDATE_BLOG_SUCCESS,
  DELETE_BLOG_SUCCESS,
  Action,
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
  isFeatured: boolean;
  isPublished: boolean;
  isDraft: boolean;
  createdAt: Date;
};

interface BlogReducer {
  blogData: IBlog | null;
  featuredBlogs: IBlog[];
  allBlogs: IBlog[];
  loading: boolean;
}

const initialState: BlogReducer = {
  blogData: null,
  featuredBlogs: [],
  allBlogs: [],
  loading: false,
};

const blogReducer = (state = initialState, action: Action) => {
  const { type, payload } = action;
  switch (type) {
    case GENERATE_BLOG_SUCCESS:
    case GET_DRAFT_SUCCESS:
    case GET_BLOG_SUCCESS:
      return {
        ...state,
        blogData: payload,
      };
    case UPDATE_BLOG_SUCCESS:
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
    default:
      return state;
  }
};

export default blogReducer;
