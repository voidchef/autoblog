// Alert
export const ALERT_CLEAR_TIME = 4000;

// App Settings
export const APP_SETTINGS_LOAD_SUCCESS = 'APP_SETTINGS_LOAD_SUCCESS';
export const SET_THEME_MODE = 'SET_THEME_MODE';
export const SET_APP_SETTINGS_LOADING_STATUS = 'SET_APP_SETTINGS_LOADING_STATUS';

// AWS
export const AWS_BASEURL = `https://${import.meta.env.VITE_AWS_BUCKET}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com`;

// Root
export const SET_LOADING = 'SET_LOADING';

// Auth
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
export const LOGOUT = 'LOGOUT';
export const SET_AUTH_LOADING_STATUS = 'SET_AUTH_LOADING_STATUS';

// User
export const USER_LOAD_SUCCESS = 'USER_LOAD_SUCCESS';
export const USER_LOAD_FAIL = 'USER_LOAD_FAIL';
export const USER_UPDATE_SUCCESS = 'USER_UPDATE_SUCCESS';
export const SET_USER_LOADING_STATUS = 'SET_USER_LOADING_STATUS';

// Blog
export const GET_BLOGS_SUCCESS = 'GET_BLOGS_SUCCESS';
export const GET_BLOG_SUCCESS = 'GET_BLOG_SUCCESS';
export const CLEAR_BLOG = 'CLEAR_BLOG';
export const GET_FEATURED_BLOGS_SUCCESS = 'GET_FEATURED_BLOGS_SUCCESS';
export const GET_DRAFTS_SUCCESS = 'GET_DRAFTS_SUCCESS';
export const GET_BLOG_VIEWS_SUCCESS = 'GET_BLOG_VIEWS_SUCCESS';
export const GENERATE_BLOG_SUCCESS = 'GENERATE_BLOG_SUCCESS';
export const UPDATE_BLOG_SUCCESS = 'UPDATE_BLOG_SUCCESS';
export const DELETE_BLOG_SUCCESS = 'DELETE_BLOG_SUCCESS';
export const SET_BLOGS_LOADING_STATUS = 'SET_BLOGS_LOADING_STATUS';

export interface Action {
  type: string;
  payload?: any;
}

export enum ALERT_TYPE {
  DANGER = 'error',
  SUCCESS = 'success',
  INFO = 'info',
}

export const SHOW_ONLY_DESKTOP = { xs: 'none', sm: 'none', md: 'block', lg: 'block' };
export const SHOW_ONLY_PHONE = { xs: 'block', sm: 'block', md: 'none', lg: 'none' };
