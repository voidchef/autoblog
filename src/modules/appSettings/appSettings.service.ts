import httpStatus from 'http-status';
import ApiError from '../errors/ApiError';
import {
  ICategories,
  IAppSettingsDoc,
  ISelectFields,
  UpdateSelectOptions,
  UpdateAppSettings,
} from './appSettings.interfaces';
import AppSettings from './appSettings.model';

/**
 * Get App Settings
 * @returns {Promise<Partial<IAppSettingsDoc> | null>}
 */
export const getAppSettings = async (): Promise<Partial<IAppSettingsDoc> | null> =>
  AppSettings.findOne().select({ apiKeys: 0 });

/**
 * Update Categories
 * @param {ICategories[]} updatedCategories
 * @returns {Promise<ICategories[] | null>}
 */
export const updateCategories = async (updatedCategories: ICategories[]): Promise<ICategories[] | null> => {
  let appSettings = await AppSettings.findOne();
  if (!appSettings) {
    appSettings = new AppSettings({ categories: updatedCategories });
  } else {
    appSettings.categories.push(...updatedCategories);
  }
  await appSettings.save();
  return appSettings.categories;
};

/**
 * Delete Categories
 * @param {string[]} categoryNames
 * @returns {Promise<ICategories[] | null>}
 */
export const deleteCategories = async (categoryNames: string[]): Promise<ICategories[] | null> => {
  const appSettings = await AppSettings.findOne();
  if (!appSettings) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No app settings found');
  }
  appSettings.categories = appSettings.categories.filter((category) => !categoryNames.includes(category.categoryName));
  await appSettings.save();
  return appSettings.categories;
};

/**
 * Update Select Fields
 * @param {UpdateSelectOptions} selectFields
 * @returns {Promise<ISelectFields | null>}
 */
export const updateSelectFields = async (selectFields: UpdateSelectOptions): Promise<ISelectFields | null> => {
  const { languages, languageModels, queryType } = selectFields;
  let appSettings = await AppSettings.findOne();
  if (!appSettings) {
    appSettings = new AppSettings({ ...selectFields });
  } else {
    if (languages) {
      appSettings.languages = languages;
    }
    if (languageModels) {
      appSettings.languageModels = languageModels;
    }
    if (queryType) {
      appSettings.queryType = queryType;
    }
  }
  await appSettings.save();
  return appSettings;
};

/**
 * Update All App Settings
 * @param {UpdateAppSettings} settings
 * @returns {Promise<IAppSettingsDoc | null>}
 */
export const updateAllAppSettings = async (settings: UpdateAppSettings): Promise<IAppSettingsDoc | null> => {
  let appSettings = await AppSettings.findOne();
  if (!appSettings) {
    appSettings = new AppSettings(settings);
  } else {
    if (settings.categories !== undefined) {
      appSettings.categories = settings.categories;
    }
    if (settings.languages !== undefined) {
      appSettings.languages = settings.languages;
    }
    if (settings.languageModels !== undefined) {
      appSettings.languageModels = settings.languageModels;
    }
    if (settings.queryType !== undefined) {
      appSettings.queryType = settings.queryType;
    }
  }
  await appSettings.save();
  return appSettings;
};
