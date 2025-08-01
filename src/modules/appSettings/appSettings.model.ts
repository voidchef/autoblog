import mongoose from 'mongoose';
import toJSON from '../toJSON/toJSON';
import paginate from '../paginate/paginate';
import { IAppSettingsDoc, IAppSettingsModel } from './appSettings.interfaces';

const appSettingsSchema = new mongoose.Schema<IAppSettingsDoc, IAppSettingsModel>(
  {
    categories: [
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
    ],
    languages: [
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
    ],
    languageModels: [
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
    ],
    queryType: [
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
    ],
  },
  {
    timestamps: true,
  },
);

// add plugin that converts mongoose to json
appSettingsSchema.plugin(toJSON);
appSettingsSchema.plugin(paginate);

const AppSettings = mongoose.model<IAppSettingsDoc, IAppSettingsModel>('AppSettings', appSettingsSchema);

export default AppSettings;
