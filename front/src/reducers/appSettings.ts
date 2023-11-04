import { Action, APP_SETTINGS_LOAD_SUCCESS, SET_THEME_MODE, RESET_APP_SETTINGS } from '../utils/consts';

export interface ICategory {
  _id: string;
  categoryName: string;
  categoryDescription: string;
  categoryPicUrl: string;
}

export interface IAppSettings {
  categories: ICategory[];
  themeMode: string;
  loading: boolean;
}

const initialState: IAppSettings = {
  categories: [],
  themeMode: 'light',
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
    case SET_THEME_MODE:
      return {
        ...state,
        themeMode: payload,
      };
    default:
      return state;
  }
};

export default appSettingsReducer;
