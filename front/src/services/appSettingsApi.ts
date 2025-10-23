import { api } from './api';
import { CACHE_TIMES } from '../utils/cacheConfig';

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

export interface ILanguageModel {
  value: string;
  label: string;
  provider: 'openai' | 'google' | 'mistral';
}

export interface IAppSettingsResponse {
  categories: ICategory[];
  languages: IFieldData[];
  languageModels: ILanguageModel[];
  queryType: IFieldData[];
}

export const appSettingsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAppSettings: builder.query<IAppSettingsResponse, void>({
      query: () => '/appSettings',
      providesTags: ['AppSettings'],
      // Cache app settings for longer periods since they change infrequently
      keepUnusedDataFor: CACHE_TIMES.APP_SETTINGS,
    }),
  }),
});

export const { useGetAppSettingsQuery, useLazyGetAppSettingsQuery } = appSettingsApi;
