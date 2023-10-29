import axios, { AxiosResponse } from 'axios';
import { Dispatch } from 'react';
import {
  GET_BLOGS_SUCCESS,
  GET_BLOGS_FAIL,
  GET_DRAFT_SUCCESS,
  GET_DRAFT_FAIL,
  GET_FEATURED_BLOGS_SUCCESS,
  GET_FEATURED_BLOGS_FAIL,
  GET_BLOG_SUCCESS,
  GET_BLOG_FAIL,
  GENERATE_BLOG_SUCCESS,
  GENERATE_BLOG_FAIL,
  UPDATE_BLOG_SUCCESS,
  UPDATE_BLOG_FAIL,
  DELETE_BLOG_SUCCESS,
  DELETE_BLOG_FAIL,
  Action,
} from '../utils/consts';

export interface IBlogData {
  title: string;
  country?: string;
  intent?: string;
  audience?: string;
  language: string;
  model: string;
  tone: string;
  category: string;
  tags?: string;
}

export const generateBlog = (blogData: IBlogData) => async (dispatch: Dispatch<any>) => {
  try {
    console.log(blogData)
    const res: AxiosResponse<any> = await axios.post(
      '/v1/blogs/',
      { ...blogData },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    dispatch({
      type: GENERATE_BLOG_SUCCESS,
      payload: res.data,
    });
  } catch (err: any) {
    console.log(err);
  }
};

export const getBlogs = (getParams: any) => async (dispatch: Dispatch<any>) => {
  try {
    const res: AxiosResponse<any> = await axios.get('/v1/blogs/', { params: { ...getParams } });
    switch (true) {
      case getParams.isDraft:
        dispatch({ type: GET_DRAFT_SUCCESS, payload: res.data.results });
        break;
      case getParams.isFeatured:
        dispatch({ type: GET_FEATURED_BLOGS_SUCCESS, payload: res.data.results });
        break;
      default:
        dispatch({ type: GET_BLOGS_SUCCESS, payload: res.data.results });
        break;
    }
  } catch (err: any) {
    console.log(err);
  }
};

export const getBlog = (blogId: string, navigate: Function) => async (dispatch: Dispatch<any>) => {
  try {
    const res: AxiosResponse<any> = await axios.get(`/v1/blogs/${blogId}`);
    dispatch({
      type: GET_BLOG_SUCCESS,
      payload: res.data,
    });
    navigate && navigate();
  } catch (err: any) {
    console.log(err);
  }
};

export const updateBlog = (updatedBlogData: any) => async (dispatch: Dispatch<any>) => {
  try {
    const res: AxiosResponse<any> = await axios.patch(
      '/v1/blogs/',
      { ...updatedBlogData },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    dispatch({
      type: UPDATE_BLOG_SUCCESS,
      payload: res.data.results[0],
    });
  } catch (err: any) {
    console.log(err);
  }
};
