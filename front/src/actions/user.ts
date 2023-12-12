import axios, { AxiosResponse } from 'axios';
import { setAlert } from './alert';
import {
  USER_LOAD_SUCCESS,
  USER_LOAD_FAIL,
  USER_UPDATE_SUCCESS,
  SET_AUTH_LOADING_STATUS,
  LOGOUT,
  Action,
  ALERT_TYPE,
} from '../utils/consts';
import { Dispatch } from 'redux';

export const loadUser = (userId: String, navigate?: Function) => async (dispatch: Dispatch<any>) => {
  try {
    dispatch({ type: SET_AUTH_LOADING_STATUS });
    const res: AxiosResponse<any> = await axios.get(`/v1/users/${userId}`);
    dispatch({
      type: USER_LOAD_SUCCESS,
      payload: res.data,
    });
    navigate && navigate();
  } catch (err: any) {
    console.log(err);
    dispatch({ type: USER_LOAD_FAIL });
    if (err.response.status === 401) return;
    dispatch(setAlert(err.response.data.message, ALERT_TYPE.DANGER));
  }
};

export const logout = () => (dispatch: Dispatch<any>) => {
  dispatch({ type: LOGOUT, payload: null });
};
