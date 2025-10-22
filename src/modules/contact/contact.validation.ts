import Joi from 'joi';
import { objectId } from '../validate/custom.validation';
import { NewContact } from './contact.interfaces';

const createContactBody: Record<keyof NewContact, any> = {
  name: Joi.string().required().trim().min(2).max(100),
  email: Joi.string().required().email().trim(),
  queryType: Joi.string().required().trim(),
  message: Joi.string().required().trim().min(10).max(2000),
};

export const createContact = {
  body: Joi.object().keys(createContactBody),
};

export const getContacts = {
  query: Joi.object().keys({
    status: Joi.string().valid('new', 'in-progress', 'resolved'),
    sortBy: Joi.string(),
    projectBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

export const getContact = {
  params: Joi.object().keys({
    contactId: Joi.string().required().custom(objectId),
  }),
};

export const updateContact = {
  params: Joi.object().keys({
    contactId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      status: Joi.string().valid('new', 'in-progress', 'resolved'),
    })
    .min(1),
};

export const deleteContact = {
  params: Joi.object().keys({
    contactId: Joi.string().required().custom(objectId),
  }),
};
