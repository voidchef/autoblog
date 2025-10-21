import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import toJSON from '../toJSON/toJSON';
import paginate from '../paginate/paginate';
import { roles } from '../../config/roles';
import { IUserDoc, IUserModel } from './user.interfaces';
import { encrypt, decrypt, isEncrypted } from '../utils/crypto';

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
      required: true,
      trim: true,
      minlength: 8,
      validate(value: string) {
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
    openAiKey: {
      type: String,
      trim: true,
      private: true, // used by the toJSON plugin to exclude from responses
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for hasOpenAiKey
userSchema.virtual('hasOpenAiKey').get(function (this: IUserDoc) {
  return !!(this.openAiKey && this.openAiKey.length > 0);
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
  // Don't re-encrypt if it's already encrypted (frontend sends encrypted data)
  // Only encrypt if it's plain text (for backward compatibility or direct backend usage)
  if (user.isModified('openAiKey') && user.openAiKey && !isEncrypted(user.openAiKey)) {
    // Use password-based encryption with user ID
    user.openAiKey = encrypt(user.openAiKey, (user._id as mongoose.Types.ObjectId).toString());
  }
  next();
});

/**
 * Method to get decrypted OpenAI key
 * @returns {string}
 */
userSchema.method('getDecryptedOpenAiKey', function (): string {
  if (!this.openAiKey) return '';
  return decrypt(this.openAiKey, (this._id as mongoose.Types.ObjectId).toString());
});

const User = mongoose.model<IUserDoc, IUserModel>('User', userSchema);

export default User;
