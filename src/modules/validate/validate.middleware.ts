import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import Joi from 'joi';
import ApiError from '../errors/ApiError';
import pick from '../utils/pick';

const validate =
  (schema: Record<string, any>) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const validSchema = pick(schema, ['params', 'query', 'body']);
    const object = pick(req, Object.keys(validSchema));
    const { value, error } = Joi.compile(validSchema)
      .prefs({ errors: { label: 'key' }, abortEarly: false })
      .validate(object);

    if (error) {
      const errorMessage = error.details.map((details) => details.message).join(', ');
      return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
    }
    // Don't assign params, query, body back to req as they have getters
    // Only assign other validated properties if any
    const filteredValue = Object.keys(value || {}).reduce((acc: any, key) => {
      if (!['params', 'query', 'body'].includes(key)) {
        acc[key] = value[key];
      }
      return acc;
    }, {});
    Object.assign(req, filteredValue);
    return next();
  };

export default validate;
