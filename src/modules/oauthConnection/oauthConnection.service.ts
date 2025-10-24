import fs from 'fs';
import axios from 'axios';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import config from '../../config/config';
import ApiError from '../errors/ApiError';
import { logger } from '../logger';
import { OAuthConnection, IOAuthConnectionDoc } from '../oauthConnection';

/**
 * Refresh Google OAuth token
 * @param {IOAuthConnectionDoc} connection - OAuth connection document
 * @returns {Promise<IOAuthConnectionDoc>}
 */
export const refreshGoogleToken = async (connection: IOAuthConnectionDoc): Promise<IOAuthConnectionDoc> => {
  if (!connection.refreshToken) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No refresh token available');
  }

  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: config.oauth.google.clientId,
      client_secret: config.oauth.google.clientSecret,
      refresh_token: connection.refreshToken,
      grant_type: 'refresh_token',
    });

    const { access_token, expires_in, refresh_token } = response.data;

    connection.accessToken = access_token;
    if (refresh_token) {
      connection.refreshToken = refresh_token;
    }
    connection.tokenExpiry = new Date(Date.now() + expires_in * 1000);

    await connection.save();
    return connection;
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Failed to refresh Google token');
  }
};

/**
 * Refresh Apple OAuth token
 * @param {IOAuthConnectionDoc} connection - OAuth connection document
 * @returns {Promise<IOAuthConnectionDoc>}
 */
export const refreshAppleToken = async (connection: IOAuthConnectionDoc): Promise<IOAuthConnectionDoc> => {
  if (!connection.refreshToken) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No refresh token available');
  }

  try {
    // Apple requires a client secret JWT
    const privateKey = fs.readFileSync(config.oauth.apple.privateKeyPath || '', 'utf8');

    const clientSecret = jwt.sign(
      {
        iss: config.oauth.apple.teamId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400 * 180, // 6 months
        aud: 'https://appleid.apple.com',
        sub: config.oauth.apple.clientId,
      },
      privateKey,
      {
        algorithm: 'ES256',
        header: {
          alg: 'ES256',
          kid: config.oauth.apple.keyId,
        },
      }
    );

    const response = await axios.post(
      'https://appleid.apple.com/auth/token',
      new URLSearchParams({
        client_id: config.oauth.apple.clientId || '',
        client_secret: clientSecret,
        refresh_token: connection.refreshToken,
        grant_type: 'refresh_token',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, expires_in, refresh_token } = response.data;

    connection.accessToken = access_token;
    if (refresh_token) {
      connection.refreshToken = refresh_token;
    }
    connection.tokenExpiry = new Date(Date.now() + (expires_in || 180 * 24 * 60 * 60) * 1000);

    await connection.save();
    return connection;
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Failed to refresh Apple token');
  }
};

/**
 * Get valid OAuth token (refresh if expired)
 * @param {IOAuthConnectionDoc} connection - OAuth connection document
 * @returns {Promise<string>}
 */
export const getValidAccessToken = async (connection: IOAuthConnectionDoc): Promise<string> => {
  if (!connection.isTokenExpired()) {
    return connection.accessToken;
  }

  // Token is expired, refresh it
  const refreshedConnection =
    connection.provider === 'google' ? await refreshGoogleToken(connection) : await refreshAppleToken(connection);

  return refreshedConnection.accessToken;
};

/**
 * Refresh token for all active connections of a user
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const refreshAllUserTokens = async (userId: string): Promise<void> => {
  const connections = await OAuthConnection.findAllByUser(userId as any);

  const refreshPromises = connections.map(async (connection: IOAuthConnectionDoc) => {
    if (connection.isTokenExpired() && connection.refreshToken) {
      try {
        if (connection.provider === 'google') {
          await refreshGoogleToken(connection);
        } else if (connection.provider === 'apple') {
          await refreshAppleToken(connection);
        }
      } catch (error) {
        // Log error but don't throw - continue refreshing other tokens
        logger.error(`Failed to refresh ${connection.provider} token for user ${userId}:`, error);
      }
    }
  });

  await Promise.all(refreshPromises);
};
