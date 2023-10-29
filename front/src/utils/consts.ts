// Alert
export const SET_ALERT = 'SET_ALERT';
export const REMOVE_ALERT = 'REMOVE_ALERT';
export const ALERT_CLEAR_TIME = 4000;

// App Settings
export const APP_SETTINGS_LOAD_SUCCESS = 'APP_SETTINGS_LOAD_SUCCESS';
export const APP_SETTINGS_LOAD_FAIL = 'APP_SETTINGS_LOAD_FAIL';
export const RESET_APP_SETTINGS = 'RESET_APP_SETTINGS';

// AWS
export const AWS_BASEURL = `https://${import.meta.env.VITE_AWS_BUCKET}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com`;

// Root
export const SET_LOADING = 'SET_LOADING';

// Auth
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAIL = 'LOGIN_FAIL';
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
export const REGISTER_FAIL = 'REGISTER_FAIL';
export const LOGOUT = 'LOGOUT';

// User
export const USER_LOAD_SUCCESS = 'USER_LOAD_SUCCESS';
export const USER_LOAD_FAIL = 'USER_LOAD_FAIL';
export const USER_UPDATE_SUCCESS = 'USER_UPDATE_SUCCESS';
export const USER_UPDATE_FAIL = 'USER_UPDATE_FAIL';
export const LOADING_USER = 'LOADING_USER';

// Blog
export const GET_BLOGS_SUCCESS = 'GET_BLOGS_SUCCESS';
export const GET_BLOGS_FAIL = 'GET_BLOGS_FAIL';
export const GET_BLOG_SUCCESS = 'GET_BLOG_SUCCESS';
export const GET_FEATURED_BLOGS_SUCCESS = 'GET_FEATURED_BLOGS_SUCCESS';
export const GET_FEATURED_BLOGS_FAIL = 'GET_FEATURED_BLOGS_FAIL';
export const GET_BLOG_FAIL = 'GET_BLOG_FAIL';
export const GET_DRAFT_SUCCESS = 'GET_DRAFT_SUCCESS';
export const GET_DRAFT_FAIL = 'GET_DRAFT_FAIL';
export const GENERATE_BLOG_SUCCESS = 'GENERATE_BLOG_SUCCESS';
export const GENERATE_BLOG_FAIL = 'GENERATE_BLOG_FAIL';
export const UPDATE_BLOG_SUCCESS = 'UPDATE_BLOG_SUCCESS';
export const UPDATE_BLOG_FAIL = 'UPDATE_BLOG_FAIL';
export const DELETE_BLOG_SUCCESS = 'DELETE_BLOG_SUCCESS';
export const DELETE_BLOG_FAIL = 'DELETE_BLOG_FAIL';

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
