import { S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env['AWS_Region'] as string,
  credentials: {
    accessKeyId: process.env['AWS_ACCESS_KEY_ID'] as string,
    secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'] as string,
  },
});

export default s3Client;
