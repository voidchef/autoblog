/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
import crypto from 'crypto';
import { BingImageCreator } from '@timefox/bic-sydney';
import downloadFiles from './download';
import AppSettings from '../appSettings/appSettings.model';

const downloadLocation = './src/modules/imgGen/images';

async function imgGen(prompt: string) {
  try {
    const appSettings = await AppSettings.findOne();

    if (!appSettings || !appSettings.apiKeys || !appSettings.apiKeys.bingToken.length) {
      throw new Error('No valid API keys found');
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const bingToken of appSettings.apiKeys.bingToken) {
      const options = {
        userToken: bingToken,
        debug: false,
      };

      const messageId = crypto.randomUUID();
      const imageList = await new BingImageCreator(options).genImageList(prompt, messageId, true);

      if (imageList.length > 0) {
        await downloadFiles(imageList, downloadLocation);
        console.log('Images downloaded successfully.');
        return;
      }
    }

    console.log('Error: No images were generated with any available tokens.');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

export default imgGen;
