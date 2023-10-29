import { Action, APP_SETTINGS_LOAD_SUCCESS, RESET_APP_SETTINGS } from '../utils/consts';

export interface ICategory {
  categoryName: string;
  categoryDescription: string;
  categoryPicUrl: string;
}

export interface IAppSettings {
  categories: ICategory[];
  loading: boolean;
}

const initialState: IAppSettings = {
  categories: [],
  loading: false,
};

const appSettingsReducer = (state = initialState, action: Action) => {
  const { type, payload } = action;
  switch (type) {
    case APP_SETTINGS_LOAD_SUCCESS:
      return {
        ...state,
        ...payload,
        loading: false,
      };
    case RESET_APP_SETTINGS:
      return { ...initialState };
    default:
      return state;
  }
};

export default appSettingsReducer;
