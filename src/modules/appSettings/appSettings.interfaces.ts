import { Model, Document } from 'mongoose';
import { QueryResult } from '../paginate/paginate';

export interface IApiKeys {
  openAi: {
    apiKey: string;
    reverseProxyUrl: string;
  };
  bingToken: string[];
  googleToken: string;
}

export interface ICategories {
  categoryName: string;
  categoryDescription: string;
  categoryPicUrl: string;
}

export interface IFieldData {
  value: string;
  label: string;
}

export interface ISelectFields {
  languages: IFieldData[];
  languageModels: IFieldData[];
  tones: IFieldData[];
  queryType: IFieldData[];
}

export interface IAppSettings extends ISelectFields {
  apiKeys: IApiKeys;
  categories: ICategories[];
}

export interface IAppSettingsDoc extends IAppSettings, Document {}

export interface IAppSettingsModel extends Model<IAppSettingsDoc> {
  paginate(filter: Record<string, any>, options: Record<string, any>): Promise<QueryResult>;
}

export type UpdateApiKeys = Partial<IApiKeys>;

export type UpdateCategories = ICategories[];

export type DeleteCategories = string[];

export type UpdateSelectOptions = Partial<ISelectFields>;

export type UpdateAppSettings = Partial<IAppSettings>;
