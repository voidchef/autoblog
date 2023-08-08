/* eslint-disable no-console */
import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';

async function downloadFiles(links: string[], downloadLocation: string): Promise<void> {
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

      // Download the file
      // eslint-disable-next-line no-await-in-loop
      await new Promise<void>((resolve, reject) => {
        const fileStream = fs.createWriteStream(filePath);
        https
          .get(link, (response) => {
            if (response.statusCode === 200) {
              response.pipe(fileStream);
              fileStream.on('finish', () => {
                fileStream.close();
                resolve();
              });
            } else {
              reject(new Error(`Failed to download ${link}. Status code: ${response.statusCode}`));
            }
          })
          .on('error', (err) => {
            reject(new Error(`Error downloading ${link}: ${err.message}`));
          });
      });

      console.log(`Downloaded: ${link}`);
      counter += 1;
    }

    console.log('All files downloaded successfully.');
  } catch (error) {
    console.error('Error occurred while downloading files:', error);
  }
}

export default downloadFiles;
