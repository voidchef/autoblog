/* eslint-disable no-console */
import crypto from 'crypto';
import { BingImageCreator } from '@timefox/bic-sydney';
import downloadFiles from './download';
import AppSettings from '../appSettings/appSettings.model';

const options = {
  userToken: '',
  debug: false,
};

const downloadLocation = './src/modules/imgGen/images';

async function imgGen(prompt: string) {
  const appSettings = await AppSettings.findOne();
  if (!appSettings) {
    throw new Error('No api keys found');
  }
  options.userToken = appSettings.apiKeys.bingToken;
  const messageId = crypto.randomUUID();
  const imageList = await new BingImageCreator(options).genImageList(prompt, messageId, true);
  if (imageList.length === 0) {
    console.log('Error generating images');
    return;
  }
  await downloadFiles(imageList, downloadLocation);
}

export default imgGen;
