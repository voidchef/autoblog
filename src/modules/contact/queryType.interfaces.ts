import { Document, Model } from 'mongoose';

export interface IQueryType {
  value: string;
  label: string;
  description?: string;
  isActive: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IQueryTypeDoc extends IQueryType, Document {}

export interface IQueryTypeModel extends Model<IQueryTypeDoc> {}

export interface NewQueryType {
  value: string;
  label: string;
  description?: string;
  isActive?: boolean;
  order?: number;
}
