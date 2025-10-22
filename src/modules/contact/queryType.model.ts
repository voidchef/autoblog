import mongoose from 'mongoose';
import { toJSON } from '../toJSON';
import { IQueryTypeDoc, IQueryTypeModel } from './queryType.interfaces';

const queryTypeSchema = new mongoose.Schema<IQueryTypeDoc, IQueryTypeModel>(
  {
    value: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
queryTypeSchema.plugin(toJSON);

// Create index for ordering
queryTypeSchema.index({ order: 1, isActive: 1 });

const QueryType = mongoose.model<IQueryTypeDoc, IQueryTypeModel>('QueryType', queryTypeSchema);

export default QueryType;
