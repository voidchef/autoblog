import { Request, Response } from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import ApiError from '../errors/ApiError';
import { OAuthConnection, oauthConnectionService, IOAuthConnectionDoc } from '../oauthConnection';
import { IUserDoc } from '../user/user.interfaces';
import catchAsync from '../utils/catchAsync';

/**
 * Get all OAuth connections for the authenticated user
 */
export const getConnections = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserDoc;
  const connections = await OAuthConnection.findAllByUser(user._id as mongoose.Types.ObjectId);

  // Return sanitized connection data (without tokens)
  const sanitizedConnections = connections.map((conn: IOAuthConnectionDoc) => ({
    id: conn._id,
    provider: conn.provider,
    email: conn.email,
    displayName: conn.displayName,
    isActive: conn.isActive,
    createdAt: conn.createdAt,
    updatedAt: conn.updatedAt,
  }));

  res.send({ connections: sanitizedConnections });
});

/**
 * Unlink an OAuth connection
 */
export const unlinkConnection = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserDoc;
  const { connectionId } = req.params;

  const connection = await OAuthConnection.findById(connectionId);

  if (!connection) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OAuth connection not found');
  }

  // Verify the connection belongs to the authenticated user
  if (connection.userId.toString() !== (user._id as mongoose.Types.ObjectId).toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only unlink your own OAuth connections');
  }

  // Check if user has a password or other OAuth connections
  const allConnections = await OAuthConnection.findAllByUser(user._id as mongoose.Types.ObjectId);

  if (!user.password && allConnections.length <= 1) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Cannot unlink the only authentication method. Please set a password first.'
    );
  }

  // Deactivate the connection
  await connection.deactivate();

  // Update user flag if no more OAuth connections
  const remainingConnections = await OAuthConnection.findAllByUser(user._id as mongoose.Types.ObjectId);
  if (remainingConnections.length === 0) {
    user.hasOAuthConnection = false;
    await user.save();
  }

  res.status(httpStatus.NO_CONTENT).send();
});

/**
 * Refresh OAuth token for a specific connection
 */
export const refreshConnectionToken = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserDoc;
  const { connectionId } = req.params;

  const connection = await OAuthConnection.findById(connectionId);

  if (!connection) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OAuth connection not found');
  }

  // Verify the connection belongs to the authenticated user
  if (connection.userId.toString() !== (user._id as mongoose.Types.ObjectId).toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only refresh your own OAuth connections');
  }

  if (!connection.refreshToken) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No refresh token available for this connection');
  }

  // Refresh the token
  const refreshedConnection =
    connection.provider === 'google'
      ? await oauthConnectionService.refreshGoogleToken(connection)
      : await oauthConnectionService.refreshAppleToken(connection);

  res.send({
    message: 'Token refreshed successfully',
    tokenExpiry: refreshedConnection.tokenExpiry,
  });
});

/**
 * Check OAuth connection status
 */
export const getConnectionStatus = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserDoc;
  const { connectionId } = req.params;

  const connection = await OAuthConnection.findById(connectionId);

  if (!connection) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OAuth connection not found');
  }

  // Verify the connection belongs to the authenticated user
  if (connection.userId.toString() !== (user._id as mongoose.Types.ObjectId).toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only view your own OAuth connections');
  }

  res.send({
    provider: connection.provider,
    email: connection.email,
    isActive: connection.isActive,
    isTokenExpired: connection.isTokenExpired(),
    tokenExpiry: connection.tokenExpiry,
    hasRefreshToken: !!connection.refreshToken,
  });
});
