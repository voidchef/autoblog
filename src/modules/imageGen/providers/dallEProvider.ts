import { DallEAPIWrapper } from '@langchain/openai';
import logger from '../../logger/logger';
import { ImageProviderError } from '../errors';
import { IImageProvider, ImageModel, ImageSize, ImageQuality, ImageStyle } from '../types';

/**
 * DALL-E image provider implementation
 */
export class DallEProvider implements IImageProvider {
  private wrapper: DallEAPIWrapper;

  constructor(
    private config: {
      model: ImageModel;
      apiKey: string;
      size: ImageSize;
      quality: ImageQuality;
      style: ImageStyle;
      numberOfImages: number;
    }
  ) {
    this.wrapper = new DallEAPIWrapper({
      n: config.numberOfImages,
      model: config.model,
      size: config.size,
      quality: config.quality,
      style: config.style,
      apiKey: config.apiKey,
    });
  }

  /**
   * Generate image using DALL-E API
   */
  async generateImage(prompt: string): Promise<string> {
    try {
      logger.debug(`Generating image with DALL-E: "${prompt.substring(0, 100)}..."`);
      const imageURL = await this.wrapper.invoke(prompt);
      logger.debug('Image generated successfully');
      return imageURL;
    } catch (error) {
      logger.error('DALL-E image generation failed:', error);
      throw new ImageProviderError(
        `DALL-E generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      );
    }
  }

  /**
   * Check if this provider supports the given model
   */
  supports(model: ImageModel): boolean {
    return model === 'dall-e-2' || model === 'dall-e-3';
  }

  /**
   * Update provider configuration
   */
  updateConfig(config: Partial<typeof this.config>): void {
    this.config = { ...this.config, ...config };

    // Recreate wrapper with new config
    this.wrapper = new DallEAPIWrapper({
      n: this.config.numberOfImages,
      model: this.config.model,
      size: this.config.size,
      quality: this.config.quality,
      style: this.config.style,
      apiKey: this.config.apiKey,
    });
  }
}
