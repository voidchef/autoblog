import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { appSettingsApi } from '../services/appSettingsApi';

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

// Load theme from localStorage or default to 'dark'
const getInitialTheme = (): string => {
  try {
    const savedTheme = localStorage.getItem('themeMode');
    return savedTheme && (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
  } catch (error) {
    console.warn('Error reading theme from localStorage:', error);
    return 'dark';
  }
};

const initialState: IAppSettings = {
  categories: [],
  languages: [],
  languageModels: [],
  tones: [],
  queryType: [],
  themeMode: getInitialTheme(),
  isLoading: false,
};

const appSettingsSlice = createSlice({
  name: 'appSettings',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<string>) => {
      state.themeMode = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(appSettingsApi.endpoints.getAppSettings.matchPending, (state) => {
        state.isLoading = true;
      })
      .addMatcher(appSettingsApi.endpoints.getAppSettings.matchFulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload.categories;
        state.languages = action.payload.languages;
        state.languageModels = action.payload.languageModels;
        state.queryType = action.payload.queryType;
      })
      .addMatcher(appSettingsApi.endpoints.getAppSettings.matchRejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { setThemeMode } = appSettingsSlice.actions;
export default appSettingsSlice.reducer;
