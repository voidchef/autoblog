import axios, { AxiosResponse } from 'axios';
import { Dispatch } from 'react';
import { APP_SETTINGS_LOAD_SUCCESS, APP_SETTINGS_LOAD_FAIL, ALERT_TYPE } from '../utils/consts';
import { setAlert } from './alert';

export const loadAppSettings = () => async (dispatch: Dispatch<any>) => {
  try {
    const res: AxiosResponse<any> = await axios.get(`/v1/appSettings/`);
    dispatch({
      type: APP_SETTINGS_LOAD_SUCCESS,
      payload: res.data,
    });
  } catch (err: any) {
    if (!err.response.data.errors) {
      dispatch(setAlert('Server Not Running', ALERT_TYPE.DANGER));
    } else {
      if (err.response.status === 401) return;
      dispatch(setAlert(err.response.data.errors.message, ALERT_TYPE.DANGER));
    }
  }
};
