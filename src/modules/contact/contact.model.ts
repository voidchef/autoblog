import mongoose from 'mongoose';
import paginate from '../paginate/paginate';
import { toJSON } from '../toJSON';
import { IContactDoc, IContactModel } from './contact.interfaces';

const contactSchema = new mongoose.Schema<IContactDoc, IContactModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate(value: string) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    queryType: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['new', 'in-progress', 'resolved'],
      default: 'new',
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
contactSchema.plugin(toJSON);
contactSchema.plugin(paginate);

const Contact = mongoose.model<IContactDoc, IContactModel>('Contact', contactSchema);

export default Contact;
