/* eslint-disable no-console */
import { readdir, readFile } from 'fs/promises';
import * as fs from 'fs';
import { promisify } from 'util';
import { PutObjectCommand, DeleteObjectCommand, HeadBucketCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import s3Client from './aws-config';

export const checkBucket = async (bucketName: string) => {
  const checkCommand = new HeadBucketCommand({ Bucket: bucketName });
  try {
    await s3Client.send(checkCommand);
    console.log(`Bucket '${bucketName}' exists.`);
  } catch (error: any) {
    if (error.name === 'NotFound') {
      console.log(`Bucket '${bucketName}' does not exist.`);
    } else {
      console.error(`Error checking bucket existence: ${error.message}`);
    }
    throw error;
  }
};

const createFolderPath = async (bucketName: string, folderPath: string) => {
  const commandParams = {
    Bucket: bucketName,
    Key: folderPath,
    Body: '',
  };

  try {
    await s3Client.send(new PutObjectCommand(commandParams));
  } catch (error: any) {
    console.error(`Error creating folder path '${folderPath}' in bucket '${bucketName}': ${error.message}`);
    throw error;
  }
};

const createFolderPathIfNotExists = async (bucketName: string, folderPath: string) => {
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: bucketName, Key: folderPath }));
    return true;
  } catch (error: any) {
    if (error.name === 'NotFound') {
      await createFolderPath(bucketName, folderPath);
      return false;
    }
    console.error(`Error checking folder existence: ${error.message}`);
    throw error;
  }
};

const deleteFileAsync = promisify(fs.unlink);

export const uploadFilesToBucket = async (bucketName: string, folderPath: string, uploadPath: string) => {
  try {
    await checkBucket(bucketName);
    await createFolderPathIfNotExists(bucketName, folderPath);
    console.log(`Uploading files from ${folderPath} to '${bucketName}/${uploadPath}'\n`);

    const keys = await readdir(folderPath);
    // eslint-disable-next-line no-restricted-syntax
    for await (const key of keys) {
      const filePath = `${folderPath}/${key}`;
      try {
        const fileContent = await readFile(filePath);
        const uploadKey = `${uploadPath}/${key}`;

        await s3Client.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Body: fileContent,
            Key: uploadKey,
          }),
        );

        await deleteFileAsync(filePath);
        console.log(`${uploadKey} uploaded successfully.`);
      } catch (error: any) {
        console.error(`Error uploading file '${key}': ${error.message}`);
        throw error;
      }
    }
  } catch (error: any) {
    console.error(`Error uploading files: ${error.message}`);
    throw error;
  }
};

export const deleteFileInBucket = async (bucketName: string, folderPath: string) => {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: folderPath,
  });

  try {
    const response = await s3Client.send(command);
    console.log(response);
  } catch (err: any) {
    console.error(`Error deleting file: ${err.message}`);
    throw err;
  }
};
