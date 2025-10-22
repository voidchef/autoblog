import mongoose from 'mongoose';
import paginate from '../paginate/paginate';
import toJSON from '../toJSON/toJSON';
import { IAppSettingsDoc, IAppSettingsModel } from './appSettings.interfaces';

const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      trim: true,
      required: true,
    },
    categoryDescription: {
      type: String,
      trim: true,
      required: true,
    },
    categoryPicUrl: {
      type: String,
      trim: true,
      required: true,
    },
  },
  { _id: false }
);

const selectFieldSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      trim: true,
      required: true,
    },
    value: {
      type: String,
      trim: true,
      required: true,
    },
  },
  { _id: false }
);

const appSettingsSchema = new mongoose.Schema<IAppSettingsDoc, IAppSettingsModel>(
  {
    categories: [categorySchema],
    languages: [selectFieldSchema],
    languageModels: [selectFieldSchema],
    queryType: [selectFieldSchema],
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
appSettingsSchema.plugin(toJSON);
appSettingsSchema.plugin(paginate);

const AppSettings = mongoose.model<IAppSettingsDoc, IAppSettingsModel>('AppSettings', appSettingsSchema);

export default AppSettings;
