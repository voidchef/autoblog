import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import * as appSettingsService from './appSettings.service';

export const updateApiKeys = catchAsync(async (req: Request, res: Response) => {
  await appSettingsService.updateApiKeys(req.body);
  res.status(httpStatus.NO_CONTENT).send('message: Api Keys updated!');
});

export const getApiKeys = catchAsync(async (_req: Request, res: Response) => {
  const result = await appSettingsService.getApiKeys();
  res.send(result);
});

export const updateCategories = catchAsync(async (req: Request, res: Response) => {
  const categories = await appSettingsService.updateCategories(req.body.categories);
  res.send(categories);
});

export const deleteCategories = catchAsync(async (req: Request, res: Response) => {
  const { keyNames } = req.body;
  await appSettingsService.deleteCategories(keyNames);
  res.status(httpStatus.NO_CONTENT).send();
});

export const getAppSettings = catchAsync(async (_req: Request, res: Response) => {
  const result = await appSettingsService.getAppSettings();
  res.send(result);
});
