import { Request, Response } from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import ApiError from '../errors/ApiError';
import { IOptions } from '../paginate/paginate';
import catchAsync from '../utils/catchAsync';
import pick from '../utils/pick';
import { IUserDoc } from './user.interfaces';
import * as userService from './user.service';

export const createUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

export const getUsers = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ['name', 'role']);
  const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

export const getUser = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['userId'] === 'string') {
    const user = await userService.getUserByIdForFrontend(new mongoose.Types.ObjectId(req.params['userId']));
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    res.send(user);
  }
});

export const updateUser = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['userId'] === 'string') {
    const user = await userService.updateUserById(new mongoose.Types.ObjectId(req.params['userId']), req.body);
    res.send(user);
  }
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['userId'] === 'string') {
    await userService.deleteUserById(new mongoose.Types.ObjectId(req.params['userId']));
    res.status(httpStatus.NO_CONTENT).send();
  }
});

export const followUser = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['userId'] === 'string') {
    const currentUser = req.user as IUserDoc;
    const user = await userService.followUser(
      currentUser._id as mongoose.Types.ObjectId,
      new mongoose.Types.ObjectId(req.params['userId'])
    );
    res.send(user);
  }
});

export const unfollowUser = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['userId'] === 'string') {
    const currentUser = req.user as IUserDoc;
    const user = await userService.unfollowUser(
      currentUser._id as mongoose.Types.ObjectId,
      new mongoose.Types.ObjectId(req.params['userId'])
    );
    res.send(user);
  }
});
