import axios, { AxiosResponse } from 'axios';
import { Dispatch } from 'react';
import {
  GET_BLOGS_SUCCESS,
  GET_DRAFTS_SUCCESS,
  GET_FEATURED_BLOGS_SUCCESS,
  GET_BLOG_SUCCESS,
  GET_BLOG_VIEWS_SUCCESS,
  GENERATE_BLOG_SUCCESS,
  UPDATE_BLOG_SUCCESS,
  DELETE_BLOG_SUCCESS,
  SET_BLOGS_LOADING_STATUS,
  ALERT_TYPE,
  CLEAR_BLOG,
} from '../utils/consts';
import { setAlert } from './alert';

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
    dispatch({ type: SET_BLOGS_LOADING_STATUS });
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
    dispatch({ type: SET_BLOGS_LOADING_STATUS });
    console.log(err);
    dispatch(setAlert('Error Generating Blog', ALERT_TYPE.DANGER));
  }
};

export const getBlogs = (getParams: any) => async (dispatch: Dispatch<any>) => {
  try {
    dispatch({ type: SET_BLOGS_LOADING_STATUS });
    const res: AxiosResponse<any> = await axios.get('/v1/blogs/', { params: { ...getParams } });
    switch (true) {
      case getParams.isDraft:
        dispatch({ type: GET_DRAFTS_SUCCESS, payload: res.data });
        break;
      case getParams.isFeatured:
        dispatch({ type: GET_FEATURED_BLOGS_SUCCESS, payload: res.data });
        break;
      default:
        dispatch({ type: GET_BLOGS_SUCCESS, payload: res.data });
        break;
    }
  } catch (err: any) {
    dispatch({ type: SET_BLOGS_LOADING_STATUS });
    console.log(err);
    dispatch(setAlert('Error Fetching Blogs', ALERT_TYPE.DANGER));
  }
};

export const getBlog = (blogId: string) => async (dispatch: Dispatch<any>) => {
  try {
    dispatch({ type: SET_BLOGS_LOADING_STATUS });
    const res: AxiosResponse<any> = await axios.get(`/v1/blogs/${blogId}`);
    dispatch({
      type: GET_BLOG_SUCCESS,
      payload: res.data,
    });
  } catch (err: any) {
    dispatch({ type: SET_BLOGS_LOADING_STATUS });
    console.log(err);
    dispatch(setAlert('Error Fetching Blog', ALERT_TYPE.DANGER));
  }
};

export const clearBlog = (navigate?: Function) => async (dispatch: Dispatch<any>) => {
  dispatch({ type: CLEAR_BLOG });
  navigate && navigate();
};

function transformReportToViewsArray(report: any, daysInMonth: number) {
  const { rows } = report;

  const viewsArray = new Array(daysInMonth).fill(null);

  rows.forEach((row: any) => {
    const dateString = row.dimensionValues[0].value;
    const day = parseInt(dateString.substring(6, 8), 10);

    viewsArray[day - 1] = parseInt(row.metricValues[0].value, 10); // Subtract 1 as array indices are zero-based
  });

  return viewsArray;
}

export const getBlogViews = (startDate: string, endDate: string, slug: string) => async (dispatch: Dispatch<any>) => {
  try {
    dispatch({ type: SET_BLOGS_LOADING_STATUS });
    const res: AxiosResponse<any> = await axios.get(`/v1/blogs/views`, {
      params: { startDate, endDate, slug },
    });

    const reportObjectArray = transformReportToViewsArray(res.data, Number(endDate.substring(8, 10)));

    dispatch({
      type: GET_BLOG_VIEWS_SUCCESS,
      payload: reportObjectArray,
    });
  } catch (err: any) {
    dispatch({ type: SET_BLOGS_LOADING_STATUS });
    console.log(err);
    dispatch(setAlert('Error Fetching Blog Views', ALERT_TYPE.DANGER));
  }
};

export const updateBlog =
  (updatedBlogData: any, preview: boolean = false, blogId?: string | null, navigate?: Function) =>
  async (dispatch: Dispatch<any>) => {
    try {
      dispatch({ type: SET_BLOGS_LOADING_STATUS });
      if (preview) {
        dispatch({
          type: UPDATE_BLOG_SUCCESS,
          payload: updatedBlogData,
        });
        navigate && navigate();
      } else {
        const res: AxiosResponse<any> = await axios.patch(
          `/v1/blogs/${blogId}`,
          { ...updatedBlogData },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
        dispatch({
          type: UPDATE_BLOG_SUCCESS,
          payload: res.data,
        });
        dispatch(setAlert('Updated Blog Successfully', ALERT_TYPE.SUCCESS));
      }
    } catch (err: any) {
      dispatch({ type: SET_BLOGS_LOADING_STATUS });
      console.log(err);
      dispatch(setAlert('Error Updating Blog', ALERT_TYPE.DANGER));
    }
  };

export const deleteBlog = (blogId: string) => async (dispatch: Dispatch<any>) => {
  try {
    dispatch({ type: SET_BLOGS_LOADING_STATUS });
    const res: AxiosResponse<any> = await axios.delete(`/v1/blogs/${blogId}`);
    dispatch({
      type: DELETE_BLOG_SUCCESS,
      payload: blogId,
    });
    dispatch(setAlert('Successfully Deleted Blog', ALERT_TYPE.SUCCESS));
  } catch (err: any) {
    dispatch({ type: SET_BLOGS_LOADING_STATUS });
    console.log(err);
    dispatch(setAlert('Error Updating Blog', ALERT_TYPE.DANGER));
  }
};
