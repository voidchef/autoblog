import { SET_LOADING, Action } from '../utils/consts';

const initialState = {
  loading: false,
};

const rootReducer = (state = initialState, action: Action) => {
  const { type, payload } = action;
  switch (type) {
    case SET_LOADING:
      return {
        ...state,
        ...payload,
      };
    default:
      return state;
  }
};

export default rootReducer;
