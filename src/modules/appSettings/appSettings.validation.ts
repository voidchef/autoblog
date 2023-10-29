import Joi from 'joi';

export const updateApiKeys = {
  body: Joi.object()
    .keys({
      openAi: Joi.object({
        apiKey: Joi.string().trim(),
        reverseProxyUrl: Joi.string().trim(),
      }),
      bingToken: Joi.string().trim(),
      googleToken: Joi.string().trim(),
    })
    .min(1),
};

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
