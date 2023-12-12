import { Action, APP_SETTINGS_LOAD_SUCCESS, SET_THEME_MODE, SET_APP_SETTINGS_LOADING_STATUS } from '../utils/consts';

export interface ICategory {
  _id: string;
  categoryName: string;
  categoryDescription: string;
  categoryPicUrl: string;
}

export interface IFieldData {
  value: string;
  label: string;
}

export interface IAppSettings {
  categories: ICategory[];
  languages: IFieldData[];
  languageModels: IFieldData[];
  tones: IFieldData[];
  queryType: IFieldData[];
  themeMode: string;
  isLoading: boolean;
}

const initialState: IAppSettings = {
  categories: [],
  languages: [],
  languageModels: [],
  tones: [],
  queryType: [],
  themeMode: 'light',
  isLoading: false,
};

const appSettingsReducer = (state = initialState, action: Action) => {
  const { type, payload } = action;
  switch (type) {
    case APP_SETTINGS_LOAD_SUCCESS:
      return {
        ...state,
        ...payload,
        isLoading: false,
      };
    case SET_THEME_MODE:
      return {
        ...state,
        themeMode: payload,
      };
    case SET_APP_SETTINGS_LOADING_STATUS:
      return {
        ...state,
        isLoading: state.isLoading ? false : true,
      };
    default:
      return state;
  }
};

export default appSettingsReducer;
