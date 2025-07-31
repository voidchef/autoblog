import { api } from './api';

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

export interface IAppSettingsResponse {
  categories: ICategory[];
  languages: IFieldData[];
  languageModels: IFieldData[];
  queryType: IFieldData[];
}

export const appSettingsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAppSettings: builder.query<IAppSettingsResponse, void>({
      query: () => '/appSettings/',
      providesTags: ['AppSettings'],
    }),
  }),
});

export const { useGetAppSettingsQuery, useLazyGetAppSettingsQuery } = appSettingsApi;
