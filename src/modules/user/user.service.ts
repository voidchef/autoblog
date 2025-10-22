import httpStatus from 'http-status';
import mongoose from 'mongoose';
import ApiError from '../errors/ApiError';
import { IOptions, QueryResult } from '../paginate/paginate';
import { NewCreatedUser, UpdateUserBody, IUserDoc, NewRegisteredUser } from './user.interfaces';
import User from './user.model';

/**
 * Create a user
 * @param {NewCreatedUser} userBody
 * @returns {Promise<IUserDoc>}
 */
export const createUser = async (userBody: NewCreatedUser): Promise<IUserDoc> => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

/**
 * Register a user
 * @param {NewRegisteredUser} userBody
 * @returns {Promise<any>}
 */
export const registerUser = async (userBody: NewRegisteredUser): Promise<any> => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  const user = await User.create(userBody);

  // Return user data with hasOpenAiKey virtual
  return user.toJSON();
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
export const queryUsers = async (filter: Record<string, any>, options: IOptions): Promise<QueryResult> => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<IUserDoc | null>}
 */
export const getUserById = async (id: mongoose.Types.ObjectId): Promise<IUserDoc | null> => {
  const user = await User.findById(id);
  return user;
};

/**
 * Get user by id with openAiKey status (for frontend)
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<any | null>}
 */
export const getUserByIdForFrontend = async (id: mongoose.Types.ObjectId): Promise<any | null> => {
  const user = await User.findById(id);
  if (!user) return null;

  // Return user data with hasOpenAiKey virtual
  return user.toJSON();
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<IUserDoc | null>}
 */
export const getUserByEmail = async (email: string): Promise<IUserDoc | null> => User.findOne({ email });

/**
 * Update user by id
 * @param {mongoose.Types.ObjectId} userId
 * @param {UpdateUserBody} updateBody
 * @returns {Promise<any | null>}
 */
export const updateUserById = async (
  userId: mongoose.Types.ObjectId,
  updateBody: UpdateUserBody
): Promise<any | null> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();

  // Return user data with hasOpenAiKey virtual
  return user.toJSON();
};

/**
 * Delete user by id
 * @param {mongoose.Types.ObjectId} userId
 * @returns {Promise<IUserDoc | null>}
 */
export const deleteUserById = async (userId: mongoose.Types.ObjectId): Promise<IUserDoc | null> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.deleteOne();
  return user;
};

/**
 * Follow a user
 * @param {mongoose.Types.ObjectId} userId - ID of the user who wants to follow
 * @param {mongoose.Types.ObjectId} targetUserId - ID of the user to be followed
 * @returns {Promise<any>}
 */
export const followUser = async (
  userId: mongoose.Types.ObjectId,
  targetUserId: mongoose.Types.ObjectId
): Promise<any> => {
  if (userId.toString() === targetUserId.toString()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You cannot follow yourself');
  }

  const user = await getUserById(userId);
  const targetUser = await getUserById(targetUserId);

  if (!user || !targetUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check if already following
  if (user.following.includes(targetUserId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You are already following this user');
  }

  // Add to following list of current user
  user.following.push(targetUserId);
  await user.save();

  // Add to followers list of target user
  targetUser.followers.push(userId);
  await targetUser.save();

  return user.toJSON();
};

/**
 * Unfollow a user
 * @param {mongoose.Types.ObjectId} userId - ID of the user who wants to unfollow
 * @param {mongoose.Types.ObjectId} targetUserId - ID of the user to be unfollowed
 * @returns {Promise<any>}
 */
export const unfollowUser = async (
  userId: mongoose.Types.ObjectId,
  targetUserId: mongoose.Types.ObjectId
): Promise<any> => {
  if (userId.toString() === targetUserId.toString()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You cannot unfollow yourself');
  }

  const user = await getUserById(userId);
  const targetUser = await getUserById(targetUserId);

  if (!user || !targetUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check if not following
  if (!user.following.includes(targetUserId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You are not following this user');
  }

  // Remove from following list of current user
  user.following = user.following.filter((id) => id.toString() !== targetUserId.toString());
  await user.save();

  // Remove from followers list of target user
  targetUser.followers = targetUser.followers.filter((id) => id.toString() !== userId.toString());
  await targetUser.save();

  return user.toJSON();
};
