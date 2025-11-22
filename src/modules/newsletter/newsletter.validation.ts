import Joi from 'joi';

const subscribe = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
  }),
};

const unsubscribe = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
  }),
};

const getSubscribers = {
  query: Joi.object().keys({
    email: Joi.string(),
    isActive: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

export default {
  subscribe,
  unsubscribe,
  getSubscribers,
};
