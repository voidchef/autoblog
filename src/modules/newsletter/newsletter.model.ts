import mongoose from 'mongoose';
import paginate from '../paginate/paginate';
import { toJSON } from '../toJSON';
import { INewsletterDoc, INewsletterModel } from './newsletter.interfaces';

const newsletterSchema = new mongoose.Schema<INewsletterDoc, INewsletterModel>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value: string) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
newsletterSchema.plugin(toJSON);
newsletterSchema.plugin(paginate);

const Newsletter = mongoose.model<INewsletterDoc, INewsletterModel>('Newsletter', newsletterSchema);

export default Newsletter;
