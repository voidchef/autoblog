import mongoose, { Model, Document } from 'mongoose';
import { QueryResult } from '../paginate/paginate';
import { AccessAndRefreshTokens } from '../token/token.interfaces';

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: string;
  isEmailVerified: boolean;
  openAiKey: string;
  bio?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
}

export interface IUserDoc extends IUser, Document {
  isPasswordMatch(password: string): Promise<boolean>;
  hasOpenAiKey(): boolean;
  getDecryptedOpenAiKey(): string;
}

export interface IUserModel extends Model<IUserDoc> {
  isEmailTaken(email: string, excludeUserId?: mongoose.Types.ObjectId): Promise<boolean>;
  paginate(filter: Record<string, any>, options: Record<string, any>): Promise<QueryResult>;
}

export type UpdateUserBody = Partial<IUser>;

export type NewRegisteredUser = Omit<IUser, 'role' | 'isEmailVerified' | 'followers' | 'following' | 'bio' | 'socialLinks'>;

export type NewCreatedUser = Omit<IUser, 'isEmailVerified' | 'followers' | 'following' | 'bio' | 'socialLinks'>;

export interface IUserWithTokens {
  user: IUserDoc;
  tokens: AccessAndRefreshTokens;
}
