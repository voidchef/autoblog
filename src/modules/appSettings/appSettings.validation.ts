import Joi from 'joi';

export const updateCategories = {
  body: Joi.object().keys({
    categories: Joi.array()
      .items({
        categoryName: Joi.string().trim(),
        categoryDescription: Joi.string().trim(),
        categoryPicUrl: Joi.string().trim(),
      })
      .min(1),
  }),
};

export const deleteCategories = {
  body: Joi.object().keys({
    categoryNames: Joi.array().items(Joi.string().trim()).min(1),
  }),
};

export const updateSelectFields = {
  body: Joi.object()
    .keys({
      languages: Joi.array().items({
        value: Joi.string().trim(),
        label: Joi.string().trim(),
      }),
      languageModels: Joi.array().items({
        value: Joi.string().trim(),
        label: Joi.string().trim(),
        provider: Joi.string().valid('openai', 'google', 'mistral').required(),
      }),
      tones: Joi.array().items({
        value: Joi.string().trim(),
        label: Joi.string().trim(),
      }),
      queryType: Joi.array().items({
        value: Joi.string().trim(),
        label: Joi.string().trim(),
      }),
    })
    .min(1),
};

export const updateAllAppSettings = {
  body: Joi.object()
    .keys({
      categories: Joi.array().items({
        categoryName: Joi.string().trim(),
        categoryDescription: Joi.string().trim(),
        categoryPicUrl: Joi.string().trim(),
      }),
      languages: Joi.array().items({
        value: Joi.string().trim(),
        label: Joi.string().trim(),
      }),
      languageModels: Joi.array().items({
        value: Joi.string().trim(),
        label: Joi.string().trim(),
        provider: Joi.string().valid('openai', 'google', 'mistral').required(),
      }),
      queryType: Joi.array().items({
        value: Joi.string().trim(),
        label: Joi.string().trim(),
      }),
    })
    .min(1),
};
