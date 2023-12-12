import httpStatus from 'http-status';
import AppSettings from './appSettings.model';
import ApiError from '../errors/ApiError';
import { IApiKeys, ICategories, IAppSettingsDoc, ISelectFields, UpdateSelectOptions } from './appSettings.interfaces';

/**
 * Update Api Keys
 * @param {IApiKeys} apiKeys
 */
export const updateApiKeys = async (apiKeys: IApiKeys) => {
  let appSettings = await AppSettings.findOne();
  if (!appSettings) {
    appSettings = new AppSettings({ apiKeys });
  } else {
    Object.assign(appSettings.apiKeys, apiKeys);
  }
  await appSettings.save();
};

/**
 * Get Api Keys
 * @returns {Promise<Partial<IAppSettingsDoc> | null>}
 */
export const getApiKeys = async (): Promise<Partial<IAppSettingsDoc> | null> => AppSettings.findOne().select('apiKeys');

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
  const { languages, languageModels, tones, queryType } = selectFields;
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
    if (tones) {
      appSettings.tones = tones;
    }
    if (queryType) {
      appSettings.queryType = queryType;
    }
  }
  await appSettings.save();
  return appSettings;
};
