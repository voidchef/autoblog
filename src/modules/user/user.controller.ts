import { Request, Response } from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import S3Utils from '../aws/S3Utils';
import ApiError from '../errors/ApiError';
import { IOptions } from '../paginate/paginate';
import catchAsync from '../utils/catchAsync';
import pick from '../utils/pick';
import { cleanupProfilePictureFile } from './profile-picture-upload.middleware';
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

export const uploadProfilePictureFile = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['userId'] === 'string') {
    const userId = new mongoose.Types.ObjectId(req.params['userId']);
    const currentUser = req.user as IUserDoc;

    // Check if user is updating their own profile picture or is an admin
    const currentUserId = currentUser._id as mongoose.Types.ObjectId;
    if (currentUserId.toString() !== userId.toString() && currentUser.role !== 'admin') {
      throw new ApiError(httpStatus.FORBIDDEN, 'You can only upload your own profile picture');
    }

    if (!req.file) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No file uploaded');
    }

    try {
      // Upload to S3
      const uploadResult = await S3Utils.uploadFromUrlsOrFiles({
        sources: [req.file.path],
        blogId: userId.toString(),
        uploadPath: `users/${userId}/profile`,
      });

      if (uploadResult.uploadedUrls.length === 0 || !uploadResult.uploadedUrls[0]) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to upload profile picture to S3');
      }

      // Update user with the profile picture URL
      const user = await userService.updateUserById(userId, {
        profilePicture: uploadResult.uploadedUrls[0],
      });

      // Clean up the temporary file
      cleanupProfilePictureFile(req.file.path);

      res.send(user);
    } catch (error) {
      // Clean up the temporary file in case of error
      if (req.file) {
        cleanupProfilePictureFile(req.file.path);
      }
      throw error;
    }
  }
});
