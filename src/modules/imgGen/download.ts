/* eslint-disable no-console */
import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';

async function downloadFile(url: string, filePath: string, timeout: number): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const fileStream = fs.createWriteStream(filePath);
    const request = https.get(url, { timeout });

    request.on('response', (response) => {
      if (response.statusCode === 200 && response.headers['content-type']?.startsWith('image')) {
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
      } else {
        reject(new Error(`Failed to download ${url}. Status code: ${response.statusCode}`));
      }
    });

    request.on('error', (err) => {
      reject(new Error(`Error downloading ${url}: ${err.message}`));
    });

    request.on('timeout', () => {
      request.destroy();
      reject(new Error(`Request to ${url} timed out after ${timeout} ms.`));
    });
  });
}

async function downloadFiles(links: string[], downloadLocation: string): Promise<void> {
  const maxRetries = 3;
  const timeoutMs = 5000; // 5 seconds timeout

  try {
    // Create the download location directory if it doesn't exist
    if (!fs.existsSync(downloadLocation)) {
      fs.mkdirSync(downloadLocation, { recursive: true });
    }

    let counter = 1; // Initialize the counter to 1

    // eslint-disable-next-line no-restricted-syntax
    for (const link of links) {
      const fileName = `${counter}.img`;
      const filePath = path.join(downloadLocation, fileName);

      let retries = 0;

      // Retry mechanism
      while (retries < maxRetries) {
        try {
          // eslint-disable-next-line no-await-in-loop
          await downloadFile(link, filePath, timeoutMs);
          console.log(`Downloaded: ${link}`);
          counter += 1;
          break; // Break out of the retry loop if successful
        } catch (error: any) {
          console.error(`Error downloading ${link} (Retry ${retries + 1}/${maxRetries}):`, error.message);
          retries += 1;
        }
      }
    }

    console.log('All files downloaded successfully.');
  } catch (error) {
    console.error('Error occurred while downloading files:', error);
  }
}

export default downloadFiles;
