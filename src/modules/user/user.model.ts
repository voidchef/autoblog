import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import validator from 'validator';
import { roles } from '../../config/roles';
import paginate from '../paginate/paginate';
import toJSON from '../toJSON/toJSON';
import { encrypt, decrypt, isEncrypted } from '../utils/crypto';
import { IUserDoc, IUserModel } from './user.interfaces';

const userSchema = new mongoose.Schema<IUserDoc, IUserModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      required(this: IUserDoc) {
        // Password is optional if user has any OAuth connections
        return !this.hasOAuthConnection;
      },
      trim: true,
      minlength: 8,
      validate(value: string) {
        if (!value) return; // Skip validation if password is not provided (OAuth users)
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
      private: true, // used by the toJSON plugin
    },
    role: {
      type: String,
      enum: roles,
      default: 'user',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    hasOAuthConnection: {
      type: Boolean,
      default: false,
    },
    openAiKey: {
      type: String,
      trim: true,
      private: true, // used by the toJSON plugin to exclude from responses
    },
    googleApiKey: {
      type: String,
      trim: true,
      private: true,
    },
    wordpressSiteUrl: {
      type: String,
      trim: true,
      private: true,
    },
    wordpressUsername: {
      type: String,
      trim: true,
      private: true,
    },
    wordpressAppPassword: {
      type: String,
      trim: true,
      private: true,
    },
    mediumIntegrationToken: {
      type: String,
      trim: true,
      private: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    profilePicture: {
      type: String,
      trim: true,
    },
    socialLinks: {
      twitter: {
        type: String,
        trim: true,
      },
      linkedin: {
        type: String,
        trim: true,
      },
      github: {
        type: String,
        trim: true,
      },
      website: {
        type: String,
        trim: true,
      },
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    subscriptionPlan: {
      type: String,
      enum: ['free', 'pro'],
      default: 'free',
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'inactive', 'expired'],
      default: 'inactive',
    },
    subscriptionExpiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for hasOpenAiKey
userSchema.virtual('hasOpenAiKey').get(function (this: IUserDoc) {
  return !!(this.openAiKey && this.openAiKey.length > 0);
});

// Virtual for hasGoogleApiKey
userSchema.virtual('hasGoogleApiKey').get(function (this: IUserDoc) {
  return !!(this.googleApiKey && this.googleApiKey.length > 0);
});

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.static('isEmailTaken', async function (email: string, excludeUserId: mongoose.ObjectId): Promise<boolean> {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
});

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.method('isPasswordMatch', async function (password: string): Promise<boolean> {
  const user = this;
  return bcrypt.compare(password, user.password);
});

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  const userId = user._id.toString();

  // Encrypt OpenAI key if modified and not already encrypted
  if (user.isModified('openAiKey') && user.openAiKey && !isEncrypted(user.openAiKey)) {
    user.openAiKey = encrypt(user.openAiKey, userId);
  }

  // Encrypt Google API key if modified and not already encrypted
  if (user.isModified('googleApiKey') && user.googleApiKey && !isEncrypted(user.googleApiKey)) {
    user.googleApiKey = encrypt(user.googleApiKey, userId);
  }

  // Encrypt WordPress app password if modified and not already encrypted
  if (user.isModified('wordpressAppPassword') && user.wordpressAppPassword && !isEncrypted(user.wordpressAppPassword)) {
    user.wordpressAppPassword = encrypt(user.wordpressAppPassword, userId);
  }

  // Encrypt Medium token if modified and not already encrypted
  if (
    user.isModified('mediumIntegrationToken') &&
    user.mediumIntegrationToken &&
    !isEncrypted(user.mediumIntegrationToken)
  ) {
    user.mediumIntegrationToken = encrypt(user.mediumIntegrationToken, userId);
  }

  next();
});

/**
 * Method to get decrypted OpenAI key
 * @returns {string}
 */
userSchema.method('getDecryptedOpenAiKey', function (): string {
  if (!this.openAiKey) return '';
  return decrypt(this.openAiKey, this._id.toString());
});

/**
 * Method to get decrypted Google API key
 * @returns {string}
 */
userSchema.method('getDecryptedGoogleApiKey', function (): string {
  if (!this.googleApiKey) return '';
  return decrypt(this.googleApiKey, this._id.toString());
});

/**
 * Check if user has WordPress configuration
 * @returns {boolean}
 */
userSchema.method('hasWordPressConfig', function (): boolean {
  return !!(this.wordpressSiteUrl && this.wordpressUsername && this.wordpressAppPassword);
});

/**
 * Method to get decrypted WordPress app password
 * @returns {string}
 */
userSchema.method('getDecryptedWordPressPassword', function (): string {
  if (!this.wordpressAppPassword) {
    throw new Error('WordPress app password not set');
  }
  const userId = this._id.toString();
  return decrypt(this.wordpressAppPassword, userId);
});

/**
 * Check if user has Medium configuration
 * @returns {boolean}
 */
userSchema.method('hasMediumConfig', function (): boolean {
  return !!this.mediumIntegrationToken;
});

/**
 * Method to get decrypted Medium integration token
 * @returns {string}
 */
userSchema.method('getDecryptedMediumToken', function (): string {
  if (!this.mediumIntegrationToken) {
    throw new Error('Medium integration token not set');
  }
  const userId = this._id.toString();
  return decrypt(this.mediumIntegrationToken, userId);
});

const User = mongoose.model<IUserDoc, IUserModel>('User', userSchema);

export default User;
