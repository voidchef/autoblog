import {
  USER_LOAD_SUCCESS,
  USER_LOAD_FAIL,
  USER_UPDATE_SUCCESS,
  SET_USER_LOADING_STATUS,
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
  isAuthenticated: boolean | null;
  userData: UserData;
  loading: boolean;
}

const initialState: UserReducerState = {
  isAuthenticated: null,
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
    case USER_LOAD_FAIL:
      return {
        ...state,
        isAuthenticated: false,
        loading: false,
      };
    case SET_USER_LOADING_STATUS:
      return { ...state, loading: true };
    case LOGOUT:
      localStorage.removeItem('tokens');
      localStorage.removeItem('userId');
      return {
        ...initialState,
        isAuthenticated: null,
      };
    default:
      return state;
  }
};

export default userReducer;
