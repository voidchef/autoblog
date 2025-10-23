import { Model, Document } from 'mongoose';
import { QueryResult } from '../paginate/paginate';

export interface ICategories {
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

export interface ISelectFields {
  languages: IFieldData[];
  languageModels: ILanguageModel[];
  queryType: IFieldData[];
}

export interface IAppSettings extends ISelectFields {
  categories: ICategories[];
}

export interface IAppSettingsDoc extends IAppSettings, Document {}

export interface IAppSettingsModel extends Model<IAppSettingsDoc> {
  paginate(filter: Record<string, any>, options: Record<string, any>): Promise<QueryResult>;
}

export type UpdateCategories = ICategories[];

export type DeleteCategories = string[];

export type UpdateSelectOptions = Partial<ISelectFields>;

export type UpdateAppSettings = Partial<IAppSettings>;
