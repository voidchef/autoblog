import Joi from 'joi';
import { NewRegisteredUser } from '../user/user.interfaces';
import { password } from '../validate/custom.validation';

const registerBody: Partial<Record<keyof NewRegisteredUser, any>> = {
  email: Joi.string().required().email(),
  password: Joi.string().required().custom(password),
  name: Joi.string().required(),
  openAiKey: Joi.string().optional(),
  googleApiKey: Joi.string().optional(),
  wordpressSiteUrl: Joi.string().optional(),
  wordpressUsername: Joi.string().optional(),
  wordpressAppPassword: Joi.string().optional(),
  mediumIntegrationToken: Joi.string().optional(),
};

export const register = {
  body: Joi.object().keys(registerBody),
};

export const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

export const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

export const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

export const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

export const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  }),
};

export const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};
