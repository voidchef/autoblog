import {
  USER_LOAD_SUCCESS,
  USER_LOAD_FAIL,
  USER_UPDATE_SUCCESS,
  USER_UPDATE_FAIL,
  LOADING_USER,
  LOGOUT,
  Action,
} from '../utils/consts';

export type UserData = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  isEmailVerified?: boolean;
};

interface UserReducerState {
  isAuthenticated: boolean;
  userData: UserData;
  loading: boolean;
}

const initialState: UserReducerState = {
  isAuthenticated: false,
  userData: {},
  loading: false,
};

const userReducer = (state = initialState, action: Action) => {
  const { type, payload } = action;
  switch (type) {
    case USER_LOAD_SUCCESS:
    case USER_UPDATE_SUCCESS:
      return {
        ...state,
        userData: payload,
        isAuthenticated: true,
        loading: false,
      };
    case LOADING_USER:
      return { ...state, loading: true };
    case LOGOUT:
      localStorage.removeItem('tokens');
      localStorage.removeItem('userId');
      return {
        ...initialState,
        isAuthenticated: false,
      };
    default:
      return state;
  }
};

export default userReducer;
