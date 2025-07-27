import { Model, Document, mongo } from 'mongoose';
import { QueryResult } from '../paginate/paginate';
import type { llm } from '../postGen/types';

export interface IGenerateBlog {
  topic: string;
  country?: string;
  intent?: string;
  audience?: string;
  language: string;
  llmModel: llm;
  category: string;
  tags?: string[];
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
  generatedImages?: string[];
  selectedImage?: string;
}

export interface IBlogDoc extends IBlog, Document {
  generateReadTime(content: string): number;
}

export interface IBlogModel extends Model<IBlogDoc> {
  paginate(filter: Record<string, any>, options: Record<string, any>): Promise<QueryResult>;
}

export type NewCreatedBlog = Omit<IBlog, 'readingTime' | 'isFeatured' | 'isPublished' | 'isDraft'>;

export type UpdateBlogBody = Partial<IBlog>;
