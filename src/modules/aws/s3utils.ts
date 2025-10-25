import { readFile, writeFile } from 'fs/promises';
import * as path from 'path';
import { PutObjectCommand, DeleteObjectCommand, HeadBucketCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import * as tmp from 'tmp';
import { v4 as generateUUID } from 'uuid';
import logger from '../logger/logger';
import s3Client from './aws-config';

export interface UploadDetails {
  sources: string[];
  blogId: string;
  uploadPath: string;
}

export interface S3Config {
  bucketName: string;
  awsRegion: string;
}

export interface UploadResult {
  uploadedUrls: string[];
  errors: string[];
}

export class S3Utils {
  private static readonly DEFAULT_EXTENSION = '.jpg';

  private getS3Config(): S3Config {
    const bucketName = process.env['AWS_BUCKET_NAME'];
    const awsRegion = process.env['AWS_REGION'];

    if (!bucketName || !awsRegion) {
      throw new Error('AWS_BUCKET_NAME and AWS_REGION environment variables must be set');
    }

    return { bucketName, awsRegion };
  }

  private isValidUrl(url: string): boolean {
    return url.startsWith('http://') || url.startsWith('https://');
  }

  private createTempFile(extension: string = ''): Promise<{ path: string; cleanup: () => void }> {
    return new Promise((resolve, reject) => {
      tmp.file({ postfix: extension, keep: false }, (err, filePath, _fd, cleanupCallback) => {
        if (err) {
          reject(new Error(`Failed to create temporary file: ${err.message}`));
        } else {
          resolve({
            path: filePath,
            cleanup: cleanupCallback,
          });
        }
      });
    });
  }

  async checkBucket(bucketName: string): Promise<boolean> {
    const checkCommand = new HeadBucketCommand({ Bucket: bucketName });
    try {
      await s3Client.send(checkCommand);
      logger.info(`Bucket '${bucketName}' exists.`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if ((error as any)?.name === 'NotFound') {
        logger.info(`Bucket '${bucketName}' does not exist.`);
      } else {
        logger.error(`Error checking bucket existence: ${errorMessage}`);
      }
      throw error;
    }
  }

  async createFolderPath(bucketName: string, folderPath: string): Promise<void> {
    const commandParams = {
      Bucket: bucketName,
      Key: folderPath,
      Body: '',
    };

    try {
      await s3Client.send(new PutObjectCommand(commandParams));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error creating folder path '${folderPath}' in bucket '${bucketName}': ${errorMessage}`);
      throw error;
    }
  }

  async createFolderPathIfNotExists(bucketName: string, folderPath: string): Promise<boolean> {
    try {
      await s3Client.send(new HeadObjectCommand({ Bucket: bucketName, Key: folderPath }));
      return true;
    } catch (error) {
      if ((error as any)?.name === 'NotFound') {
        await this.createFolderPath(bucketName, folderPath);
        return false;
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error checking folder existence: ${errorMessage}`);
      throw error;
    }
  }

  async downloadFileFromUrl(url: string, filePath: string): Promise<void> {
    if (!this.isValidUrl(url)) {
      throw new Error(`Invalid URL: ${url}`);
    }

    try {
      logger.info(`Downloading file from: ${url}`);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      await writeFile(filePath, buffer);
      logger.info(`File downloaded successfully to: ${filePath}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error downloading file from ${url}: ${errorMessage}`);
      throw error;
    }
  }

  private getFileExtensionFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathName = urlObj.pathname;
      const extension = path.extname(pathName).toLowerCase();

      // If no extension found, try to guess from content-type or default to .jpg
      if (!extension) {
        const contentType = urlObj.searchParams.get('content-type');
        if (contentType) {
          if (contentType.includes('image/png')) return '.png';
          if (contentType.includes('image/gif')) return '.gif';
          if (contentType.includes('image/webp')) return '.webp';
        }
        return S3Utils.DEFAULT_EXTENSION;
      }

      return S3Utils.DEFAULT_EXTENSION;
    } catch {
      return S3Utils.DEFAULT_EXTENSION;
    }
  }

  private async processSource(
    source: string,
    uploadPath: string,
    bucketName: string,
    awsBaseUrl: string,
    uploadedUrls: string[],
    errors: string[]
  ): Promise<void> {
    const isUrl = this.isValidUrl(source);
    let tempFile: { path: string; cleanup: () => void } | null = null;
    let fileName: string;
    let filePath: string;

    try {
      if (isUrl) {
        // Handle URL - create temporary file
        const extension = this.getFileExtensionFromUrl(source);
        fileName = generateUUID() + extension;
        tempFile = await this.createTempFile(extension);
        filePath = tempFile.path;
        await this.downloadFileFromUrl(source, filePath);
      } else {
        // Handle local file
        fileName = path.basename(source);
        filePath = source;
      }

      const fileContent = await readFile(filePath);
      const uploadKey = `${uploadPath}/${fileName}`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Body: fileContent,
          Key: uploadKey,
        })
      );

      const s3ImageUrl = `${awsBaseUrl}/${uploadKey}`;
      uploadedUrls.push(s3ImageUrl);

      logger.info(`${uploadKey} uploaded successfully from ${isUrl ? 'URL' : 'file'}.`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorLog = `Error processing source '${source}': ${errorMessage}`;
      logger.error(errorLog);
      errors.push(errorLog);
    } finally {
      // Clean up temporary file if it was created
      if (tempFile) {
        try {
          tempFile.cleanup();
        } catch (cleanupError) {
          logger.warn(
            `Failed to cleanup temporary file: ${cleanupError instanceof Error ? cleanupError.message : 'Unknown error'}`
          );
        }
      }
    }
  }

  public async uploadFromUrlsOrFiles(uploadData: UploadDetails): Promise<UploadResult> {
    const { sources, uploadPath } = uploadData;
    const { bucketName, awsRegion } = this.getS3Config();
    const awsBaseUrl = `https://${bucketName}.s3.${awsRegion}.amazonaws.com`;

    const uploadedUrls: string[] = [];
    const errors: string[] = [];

    try {
      await this.checkBucket(bucketName);
      await this.createFolderPathIfNotExists(bucketName, `${uploadPath}/`);

      logger.info(`Processing ${sources.length} sources for upload to '${bucketName}/${uploadPath}'\n`);

      for (let i = 0; i < sources.length; i++) {
        const source = sources[i];

        if (!source) {
          logger.warn(`Skipping empty source at index ${i}`);
          continue;
        }

        await this.processSource(source, uploadPath, bucketName, awsBaseUrl, uploadedUrls, errors);
      }

      return { uploadedUrls, errors };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error uploading images from sources: ${errorMessage}`);
      throw error;
    }
  }

  async deleteFileInBucket(bucketName: string, key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    try {
      const response = await s3Client.send(command);
      logger.info(`Successfully deleted file: ${key}`);
      logger.info(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error deleting file '${key}': ${errorMessage}`);
      throw error;
    }
  }
}

export default new S3Utils();
