import { Document, Model } from 'mongoose';
import { QueryResult } from '../paginate/paginate';

export interface IContact {
  name: string;
  email: string;
  queryType: string;
  message: string;
  status: 'new' | 'in-progress' | 'resolved';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IContactDoc extends IContact, Document {}

export interface IContactModel extends Model<IContactDoc> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  paginate(filter: Record<string, any>, options: Record<string, any>): Promise<QueryResult>;
}

export interface NewContact {
  name: string;
  email: string;
  queryType: string;
  message: string;
}
