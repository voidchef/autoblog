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
const uploadsDir = path.join(process.cwd(), 'uploads', 'templates');
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
    cb(null, `template-${uniqueSuffix}${ext}`);
  },
});

// File filter to accept only markdown files
const fileFilter = (req: Request, file: MulterFile, cb: FileFilterCallback) => {
  const allowedExtensions = ['.md', '.markdown'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    const error = new ApiError(httpStatus.BAD_REQUEST, 'Only markdown files (.md, .markdown) are allowed');
    cb(error);
  }
};

// Configure multer
export const uploadTemplate = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Cleanup function to delete uploaded template files after use
export const cleanupTemplateFile = (filePath: string): void => {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    if (fs.existsSync(filePath)) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    logger.error('Error cleaning up template file:', error);
  }
};
