import mongoose from 'mongoose';
import toJSON from '../toJSON/toJSON';
import paginate from '../paginate/paginate';
import { IAppSettingsDoc, IAppSettingsModel } from './appSettings.interfaces';

const appSettingsSchema = new mongoose.Schema<IAppSettingsDoc, IAppSettingsModel>(
  {
    apiKeys: {
      openAi: {
        apiKey: {
          type: String,
          trim: true,
        },
        reverseProxyUrl: {
          type: String,
          trim: true,
        },
      },
      bingToken: [
        {
          type: String,
          trim: true,
        },
      ],
      googleToken: {
        type: String,
        trim: true,
      },
    },
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
