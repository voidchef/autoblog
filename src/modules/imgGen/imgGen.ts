/* eslint-disable no-console */
import crypto from 'crypto';
import { BingImageCreator } from '@timefox/bic-sydney';
import downloadFiles from './download';

const options = {
  userToken: process.env['BING_TOKEN'],
  debug: false,
};

const downloadLocation = './src/modules/imgGen/images';

async function imgGen(prompt: string) {
  const messageId = crypto.randomUUID();
  const imageList = await new BingImageCreator(options).genImageList(prompt, messageId, true);
  if (imageList.length === 0) {
    console.log('Error generating images');
    return;
  }
  await downloadFiles(imageList, downloadLocation);
}

export default imgGen;
