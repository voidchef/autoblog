import {
  REGISTER_SUCCESS,
  LOGIN_SUCCESS,
  SET_AUTH_LOADING_STATUS,
  Action,
} from '../utils/consts';

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
  isLoading: boolean;
}

const initialState: AuthReducer = {
  tokens: JSON.parse(localStorage.getItem('tokens') || JSON.stringify('')),
  userId: localStorage.getItem('userId') || '',
  isLoading: false,
};

const authReducer = (state = initialState, action: Action) => {
  const { type, payload } = action;
  switch (type) {
    case LOGIN_SUCCESS:
    case REGISTER_SUCCESS:
      localStorage.setItem('tokens', JSON.stringify(payload.tokens));
      localStorage.setItem('userId', payload.user.id);
      return {
        ...state,
        ...payload,
        isLoading: false,
      };
    case SET_AUTH_LOADING_STATUS:
      return {
        ...state,
        isLoading: state.isLoading ? false : true,
      };
    default:
      return state;
  }
};

export default authReducer;
