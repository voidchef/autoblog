import fs from 'fs';
import path from 'path';
import { Request } from 'express';
import httpStatus from 'http-status';
import multer, { FileFilterCallback } from 'multer';
import ApiError from '../errors/ApiError';
import logger from '../logger/logger';

// Type alias for Multer file to avoid ESLint errors with global Express namespace
// eslint-disable-next-line no-undef
type MulterFile = Express.Multer.File;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads', 'profile-pictures');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req: Request, file: MulterFile, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadsDir);
  },
  filename: (req: Request, file: MulterFile, cb: (error: Error | null, filename: string) => void) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `profile-${uniqueSuffix}${ext}`);
  },
});

// File filter to accept only image files
const fileFilter = (req: Request, file: MulterFile, cb: FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    const error = new ApiError(httpStatus.BAD_REQUEST, 'Only image files (jpg, jpeg, png, gif, webp) are allowed');
    cb(error);
  }
};

// Configure multer
export const uploadProfilePicture = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Cleanup function to delete uploaded profile picture files after use
export const cleanupProfilePictureFile = (filePath: string): void => {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    if (fs.existsSync(filePath)) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.unlinkSync(filePath);
      logger.info(`Deleted temporary profile picture file: ${filePath}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.warn(`Failed to delete temporary profile picture file: ${errorMessage}`);
  }
};
