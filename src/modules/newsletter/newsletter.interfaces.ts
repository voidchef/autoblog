import { Document, Model } from 'mongoose';
import { QueryResult } from '../paginate/paginate';

export interface INewsletter {
  email: string;
  isActive: boolean;
  subscribedAt?: Date;
  unsubscribedAt?: Date;
}

export interface INewsletterDoc extends INewsletter, Document {
  id: string;
}

export interface INewsletterModel extends Model<INewsletterDoc> {
  paginate(filter: Record<string, any>, options: Record<string, any>): Promise<QueryResult>;
}
