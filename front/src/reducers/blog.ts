import {
  GET_BLOGS_SUCCESS,
  GET_BLOG_SUCCESS,
  GET_DRAFT_SUCCESS,
  GENERATE_BLOG_SUCCESS,
  UPDATE_BLOG_SUCCESS,
  DELETE_BLOG_SUCCESS,
  Action,
} from '../utils/consts';

interface BlogReducer {
  blogData: any;
  allBlogs: any[];
  loading: boolean;
}

const initialState: BlogReducer = {
  blogData: null,
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
    default:
      return state;
  }
};

export default blogReducer;
