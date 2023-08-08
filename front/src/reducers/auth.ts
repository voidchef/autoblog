import { REGISTER_SUCCESS, REGISTER_FAIL, LOGIN_SUCCESS, LOGIN_FAIL, Action } from '../utils/consts';

export type TokenData = {
  access: {
    token: string;
    expires: string;
  };
  refresh: {
    token: string;
    expires: string;
  };
};

interface AuthReducer {
  tokens: TokenData;
  userId: string;
}

const initialState: AuthReducer = {
  /* tokens: {
    access: {
      token: localStorage.getItem('accessToken') || '',
      expires: localStorage.getItem('accessTokenExpiry') || '',
    },
    refresh: {
      token: localStorage.getItem('refreshToken') || '',
      expires: localStorage.getItem('refreshTokenExpiry') || '',
    },
  }, */
  tokens: JSON.parse(localStorage.getItem('tokens') || JSON.stringify('')),
  userId: localStorage.getItem('userId') || '',
};

const authReducer = (state = initialState, action: Action) => {
  const { type, payload } = action;
  switch (type) {
    case LOGIN_SUCCESS:
    case REGISTER_SUCCESS:
      /* localStorage.setItem('accessToken', payload.tokens.access.token);
      localStorage.setItem('accessTokenExpiry', payload.tokens.access.expires);
      localStorage.setItem('refreshToken', payload.tokens.refresh.token);
      localStorage.setItem('refreshTokenExpiry', payload.tokens.refresh.expires);
      localStorage.setItem('userId', payload.userId); */
      localStorage.setItem('tokens', JSON.stringify(payload.tokens));
      localStorage.setItem('userId', payload.user.id);
      return {
        ...state,
        ...payload,
      };
    case REGISTER_FAIL:
    case LOGIN_FAIL:
      /* localStorage.removeItem('accessToken');
      localStorage.removeItem('accessTokenExpiry');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('refreshTokenExpiry');
      localStorage.removeItem('userId'); */
      localStorage.removeItem('tokens');
      localStorage.removeItem('userId');
      return {
        ...state,
      };
    default:
      return state;
  }
};

export default authReducer;
