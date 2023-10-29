import axios, { AxiosResponse } from 'axios';
import { setAlert } from './alert';
import { REGISTER_SUCCESS, REGISTER_FAIL, LOGIN_SUCCESS, LOGIN_FAIL, Action, ALERT_TYPE } from '../utils/consts';
import { Dispatch } from 'redux';
import { loadUser } from './user';
import setAuthToken from '../utils/setAuthToken';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export const register = (registerData: RegisterData, navigate: Function) => async (dispatch: Dispatch<any>) => {
  try {
    const res: AxiosResponse<any> = await axios.post('/v1/auth/register', registerData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    dispatch({
      type: REGISTER_SUCCESS,
      payload: res.data,
    });
    navigate && navigate();
  } catch (err: any) {
    console.log(err);
    dispatch(setAlert(err.response.data.message, ALERT_TYPE.DANGER));
  }
};

export interface LoginData {
  email: string;
  password: string;
}

export const login = (loginData: LoginData, navigate: Function) => async (dispatch: Dispatch<any>) => {
  try {
    const res: AxiosResponse<any> = await axios.post('/v1/auth/login', loginData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    setAuthToken(res.data.tokens.access.token);
    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data,
    });
    dispatch(loadUser(res.data.user.id, navigate));
  } catch (err: any) {
    console.log(err);
    dispatch(setAlert(err.response.data.message, ALERT_TYPE.DANGER));
  }
};
