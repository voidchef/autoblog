import Joi from 'joi';
import { NewQueryType } from './queryType.interfaces';

const createQueryTypeBody: Record<keyof NewQueryType, any> = {
  value: Joi.string().required().trim().lowercase(),
  label: Joi.string().required().trim(),
  description: Joi.string().optional().trim(),
  isActive: Joi.boolean().optional(),
  order: Joi.number().integer().optional(),
};

export const createQueryType = {
  body: Joi.object().keys(createQueryTypeBody),
};

export const getQueryTypes = {
  query: Joi.object().keys({
    includeInactive: Joi.boolean().optional(),
  }),
};
