import logger from '../logger/logger';
import { BasePostPrompt } from '../postGen/types';
import { InvalidConfigurationError, ImageGenerationError } from './errors';
import { PromptOptimizer } from './promptOptimizer';
import { DallEProvider } from './providers';
import {
  ImageGenerationConfig,
  GeneratedImage,
  IImageProvider,
  BlogImageStyle,
  BatchImageGenerationResult,
  PromptContext,
} from './types';
import { withRetry, processBatch } from './utils';

/**
 * Enhanced Image Generator with improved error handling, retry logic, and extensibility
 */
export class ImageGenerator {
  private provider: IImageProvider;
  private promptOptimizer: PromptOptimizer;
  private config: ImageGenerationConfig;

  constructor(config: ImageGenerationConfig) {
    this.validateConfig(config);
    this.config = {
      maxRetries: 3,
      retryDelay: 1000,
      ...config,
    };

    // Initialize provider
    this.provider = new DallEProvider({
      model: config.model,
      apiKey: config.apiKey,
      size: config.size,
      quality: config.quality,
      style: config.style,
      numberOfImages: config.numberOfImages,
    });

    // Initialize prompt optimizer with caching
    this.promptOptimizer = new PromptOptimizer(config.apiKey, {
      useCache: true,
      cacheSize: 100,
    });
  }

  /**
   * Generate a single image with retry logic and error handling
   */
  async generateImage(prompt: string, context?: PromptContext): Promise<GeneratedImage> {
    logger.info(`Generating image for prompt: "${prompt.substring(0, 100)}..."`);

    try {
      // Optimize prompt with fallback to original
      let optimizedPrompt = prompt;
      try {
        optimizedPrompt = await this.promptOptimizer.optimize(prompt, context);
        logger.debug(`Optimized prompt: "${optimizedPrompt}"`);
      } catch (error) {
        logger.warn('Prompt optimization failed, using original prompt', error);
        optimizedPrompt = prompt;
      }

      // Generate image with retry logic
      const imageURL = await withRetry(
        () => this.provider.generateImage(optimizedPrompt),
        {
          maxRetries: this.config.maxRetries ?? 3,
          initialDelay: this.config.retryDelay ?? 1000,
        },
        `image generation`
      );

      const generatedImage: GeneratedImage = {
        url: imageURL,
        prompt: prompt,
        ...(optimizedPrompt !== prompt && { revisedPrompt: optimizedPrompt }),
        metadata: {
          model: this.config.model,
          size: this.config.size,
          quality: this.config.quality,
          style: this.config.style,
          timestamp: new Date(),
        },
      };

      logger.info('Image generated successfully');
      return generatedImage;
    } catch (error) {
      logger.error('Failed to generate image:', error);
      throw new ImageGenerationError(
        `Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error,
        false
      );
    }
  }

  /**
   * Generate multiple images with controlled concurrency and batch error handling
   */
  async generateImages(
    prompts: string[],
    options: {
      context?: PromptContext;
      concurrency?: number;
      stopOnError?: boolean;
    } = {}
  ): Promise<BatchImageGenerationResult> {
    const { concurrency = 3, stopOnError = false, context } = options;

    logger.info(`Generating ${prompts.length} images with concurrency ${concurrency}`);

    const results = await processBatch(
      prompts,
      async (prompt, index) => {
        logger.debug(`Processing image ${index + 1}/${prompts.length}`);
        return await this.generateImage(prompt, context);
      },
      {
        concurrency,
        stopOnError,
        onProgress: (completed, total) => {
          if (completed % 5 === 0 || completed === total) {
            logger.info(`Image generation progress: ${completed}/${total}`);
          }
        },
      }
    );

    const successful = results.filter((r) => r.success && r.result).map((r) => r.result!);
    const failed = results
      .filter((r) => !r.success)
      .map((r) => ({
        prompt: r.item,
        error: r.error || new Error('Unknown error'),
      }));

    logger.info(`Batch generation complete: ${successful.length} successful, ${failed.length} failed`);

    return {
      successful,
      failed,
      totalRequested: prompts.length,
    };
  }

  /**
   * Create an optimized blog image prompt with context
   */
  static createBlogImagePrompt(title: string, keywords: string[] = [], style: BlogImageStyle = 'professional'): string {
    const keywordText = keywords.length > 0 ? `, featuring ${keywords.join(', ')}` : '';

    const styleDescriptors: Record<BlogImageStyle, string> = {
      professional: 'professional, clean, modern, high-quality illustration',
      creative: 'creative, artistic, vibrant, engaging illustration',
      minimal: 'minimal, clean, simple, elegant design',
    };

    const descriptor = styleDescriptors[style];
    return `${title}${keywordText}, ${descriptor}, blog post header image, digital art, no text`;
  }

  /**
   * Create an ImageGenerator instance from PostPrompt configuration
   */
  static fromPostPrompt(postPrompt: BasePostPrompt): ImageGenerator {
    const apiKey = postPrompt.apiKey || process.env['OPENAI_API_KEY'];

    if (!apiKey) {
      throw new InvalidConfigurationError(
        'API key is required for image generation. Set OPENAI_API_KEY environment variable or provide apiKey in postPrompt.'
      );
    }

    const config: ImageGenerationConfig = {
      model: 'dall-e-3',
      size: '1024x1024',
      quality: 'standard',
      style: 'natural',
      apiKey,
      numberOfImages: 1,
      ...(postPrompt.debug !== undefined && { debug: postPrompt.debug }),
      maxRetries: 3,
      retryDelay: 1000,
    };

    return new ImageGenerator(config);
  }

  /**
   * Validate configuration
   */
  private validateConfig(config: ImageGenerationConfig): void {
    if (!config.apiKey) {
      throw new InvalidConfigurationError('API key is required');
    }

    if (config.numberOfImages < 1 || config.numberOfImages > 10) {
      throw new InvalidConfigurationError('numberOfImages must be between 1 and 10');
    }

    // Validate model-specific constraints
    if (config.model === 'dall-e-2') {
      const validSizes: string[] = ['256x256', '512x512', '1024x1024'];
      if (!validSizes.includes(config.size)) {
        throw new InvalidConfigurationError(
          `Invalid size for dall-e-2: ${config.size}. Valid sizes: ${validSizes.join(', ')}`
        );
      }
      if (config.quality === 'hd') {
        throw new InvalidConfigurationError('HD quality is only available for dall-e-3');
      }
    }
  }

  /**
   * Update generator configuration
   */
  updateConfig(config: Partial<ImageGenerationConfig>): void {
    this.config = { ...this.config, ...config };

    if (config.apiKey || config.model || config.size || config.quality || config.style) {
      this.provider = new DallEProvider({
        model: this.config.model,
        apiKey: this.config.apiKey,
        size: this.config.size,
        quality: this.config.quality,
        style: this.config.style,
        numberOfImages: this.config.numberOfImages,
      });
    }
  }

  /**
   * Clear internal caches
   */
  clearCache(): void {
    this.promptOptimizer.clearCache();
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<ImageGenerationConfig> {
    return { ...this.config };
  }
}

// Re-export types for backward compatibility
export type { ImageGenerationConfig as ImageGenerationOptions, GeneratedImage };
