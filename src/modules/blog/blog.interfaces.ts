import { Model, Document, mongo } from 'mongoose';
import { QueryResult } from '../paginate/paginate';

export interface IGenerateBlog {
  topic: string;
  country?: string;
  intent?: string;
  audience?: string;
  language: string;
  model: 'gpt-4' | 'gpt-3.5-turbo';
  tone: 'informative' | 'captivating';
  category: string;
  tags?: string;
}

export interface IBlog extends IGenerateBlog {
  title: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  author: mongo.ObjectId;
  readingTime: number;
  content: string;
  isFeatured: boolean;
  isPublished: boolean;
  isDraft: boolean;
}

export interface IBlogDoc extends IBlog, Document {
  generateReadTime(content: string): number;
}

export interface IBlogModel extends Model<IBlogDoc> {
  paginate(filter: Record<string, any>, options: Record<string, any>): Promise<QueryResult>;
}

export type NewCreatedBlog = Omit<IBlog, 'readingTime' | 'isFeatured' | 'isPublished' | 'isDraft'>;

export type UpdateBlogBody = Partial<IBlog>;
