import axios, { AxiosResponse } from 'axios';
import { setAlert } from './alert';
import {
  USER_LOAD_SUCCESS,
  USER_LOAD_FAIL,
  USER_UPDATE_SUCCESS,
  USER_UPDATE_FAIL,
  LOADING_USER,
  LOGOUT,
  Action,
  ALERT_TYPE,
} from '../utils/consts';
import { Dispatch } from 'redux';

export const loadUser = (userId: String) => async (dispatch: Dispatch<any>) => {
  console.log(axios.defaults.headers.common);
  try {
    dispatch({ type: LOADING_USER });
    const res: AxiosResponse<any> = await axios.get(`/v1/users/${userId}`);
    console.log('axios.defaults.headers.common', axios.defaults.headers.common);
    dispatch({
      type: USER_LOAD_SUCCESS,
      payload: res.data,
    });
  } catch (err: any) {
    console.log(err);
    dispatch(setAlert(err.response.data.message, ALERT_TYPE.DANGER));
  }
};

export const logout = () => (dispatch: Dispatch<any>) => {
  dispatch({ type: LOGOUT, payload: null });
};
