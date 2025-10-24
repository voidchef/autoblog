import mongoose, { Document, Model } from 'mongoose';

export interface IOAuthConnection {
  userId: mongoose.Types.ObjectId;
  provider: 'google' | 'apple';
  providerId: string;
  email: string;
  displayName?: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  scopes: string[];
  profileData?: any;
  isActive: boolean;
}

export interface IOAuthConnectionDoc extends IOAuthConnection, Document {
  createdAt: Date;
  updatedAt: Date;
  isTokenExpired(): boolean;
  deactivate(): Promise<IOAuthConnectionDoc>;
}

export interface IOAuthConnectionModel extends Model<IOAuthConnectionDoc> {
  findByUserAndProvider(userId: mongoose.Types.ObjectId, provider: string): Promise<IOAuthConnectionDoc | null>;
  findAllByUser(userId: mongoose.Types.ObjectId): Promise<IOAuthConnectionDoc[]>;
}
