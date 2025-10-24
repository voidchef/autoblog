import mongoose from 'mongoose';
import toJSON from '../toJSON/toJSON';
import { IOAuthConnectionDoc, IOAuthConnectionModel } from './oauthConnection.interfaces';

const oauthConnectionSchema = new mongoose.Schema<IOAuthConnectionDoc, IOAuthConnectionModel>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ['google', 'apple'],
      required: true,
    },
    providerId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    displayName: {
      type: String,
    },
    accessToken: {
      type: String,
      required: true,
      private: true, // Excluded from JSON responses
    },
    refreshToken: {
      type: String,
      private: true,
    },
    tokenExpiry: {
      type: Date,
    },
    scopes: {
      type: [String],
      default: [],
    },
    profileData: {
      type: mongoose.Schema.Types.Mixed,
      private: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one provider account per user
oauthConnectionSchema.index({ userId: 1, provider: 1, providerId: 1 }, { unique: true });

// Add plugin that converts mongoose to json
oauthConnectionSchema.plugin(toJSON);

/**
 * Check if token is expired
 */
oauthConnectionSchema.methods['isTokenExpired'] = function (): boolean {
  if (!this['tokenExpiry']) return true;
  return new Date() >= this['tokenExpiry'];
};

/**
 * Get OAuth connection by user and provider
 */
oauthConnectionSchema.static(
  'findByUserAndProvider',
  async function (userId: mongoose.Types.ObjectId, provider: string): Promise<IOAuthConnectionDoc | null> {
    return this.findOne({ userId, provider, isActive: true });
  }
);

/**
 * Get all active connections for a user
 */
oauthConnectionSchema.static('findAllByUser', async function (userId: mongoose.Types.ObjectId): Promise<
  IOAuthConnectionDoc[]
> {
  return this.find({ userId, isActive: true });
});

/**
 * Deactivate connection
 */
oauthConnectionSchema.methods['deactivate'] = async function (): Promise<IOAuthConnectionDoc> {
  this['isActive'] = false;
  return this['save']();
};

const OAuthConnection = mongoose.model<IOAuthConnectionDoc, IOAuthConnectionModel>(
  'OAuthConnection',
  oauthConnectionSchema
);

export default OAuthConnection;
