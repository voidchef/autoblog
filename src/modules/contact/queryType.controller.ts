import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import * as queryTypeService from './queryType.service';

export const createQueryType = catchAsync(async (req: Request, res: Response) => {
  const queryType = await queryTypeService.createQueryType(req.body);
  res.status(httpStatus.CREATED).send(queryType);
});

export const getQueryTypes = catchAsync(async (req: Request, res: Response) => {
  const includeInactive = req.query['includeInactive'] === 'true';
  const queryTypes = includeInactive
    ? await queryTypeService.getAllQueryTypes()
    : await queryTypeService.getActiveQueryTypes();
  res.send(queryTypes);
});
