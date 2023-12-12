import axios, { AxiosResponse } from 'axios';
import { Dispatch } from 'react';
import { APP_SETTINGS_LOAD_SUCCESS, SET_APP_SETTINGS_LOADING_STATUS, SET_THEME_MODE, ALERT_TYPE } from '../utils/consts';
import { setAlert } from './alert';

export const loadAppSettings = () => async (dispatch: Dispatch<any>) => {
  try {
    dispatch({
      type: SET_APP_SETTINGS_LOADING_STATUS,
    });
    const res: AxiosResponse<any> = await axios.get(`/v1/appSettings/`);
    dispatch({
      type: APP_SETTINGS_LOAD_SUCCESS,
      payload: res.data,
    });
  } catch (err: any) {
    dispatch({
      type: SET_APP_SETTINGS_LOADING_STATUS,
    });
    console.log(err);
    dispatch(setAlert('Server Not Running', ALERT_TYPE.DANGER));
  }
};

export const changeThemeMode = (themeMode: string) => async (dispatch: Dispatch<any>) => {
  try {
    dispatch({
      type: SET_THEME_MODE,
      payload: themeMode,
    });
  } catch (err: any) {
    console.log(err);
    dispatch(setAlert('Error changing theme', ALERT_TYPE.DANGER));
  }
};
