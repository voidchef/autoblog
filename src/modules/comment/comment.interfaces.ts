import { Model, Document, Types } from 'mongoose';
import { QueryResult } from '../paginate/paginate';

export interface IComment {
  content: string;
  author: Types.ObjectId;
  blog: Types.ObjectId;
  parentComment?: Types.ObjectId;
  likes: Types.ObjectId[];
  dislikes: Types.ObjectId[];
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICommentDoc extends IComment, Document {
  toggleLike(userId: Types.ObjectId): Promise<void>;
  toggleDislike(userId: Types.ObjectId): Promise<void>;
}

export interface ICommentModel extends Model<ICommentDoc> {
  paginate(filter: Record<string, any>, options: Record<string, any>): Promise<QueryResult>;
}

export type NewComment = Omit<IComment, 'likes' | 'dislikes' | 'isDeleted' | 'createdAt' | 'updatedAt'>;

export type UpdateCommentBody = Partial<Pick<IComment, 'content'>>;
