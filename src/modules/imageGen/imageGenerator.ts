import { HumanMessage } from '@langchain/core/messages';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatOpenAI, DallEAPIWrapper } from '@langchain/openai';
import { BasePostPrompt } from '../postGen/types';
import logger from '../logger/logger';

export interface ImageGenerationOptions {
  model: 'dall-e-2' | 'dall-e-3';
  apiKey: string;
  size: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  quality: 'standard' | 'hd';
  style: 'vivid' | 'natural';
  numberOfImages: number;
  debug?: boolean;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  revisedPrompt?: string;
}

/**
 * Image generator using OpenAI's DALL-E integration
 * Since LangChain doesn't directly expose DALL-E, we'll create a wrapper
 * that uses the text generation to create optimized prompts and simulates image generation
 */
export class ImageGenerator {
  private llm: BaseChatModel;
  private tool: DallEAPIWrapper;

  constructor(private options: ImageGenerationOptions) {
    // Initialize ChatOpenAI for prompt optimization
    const apiKey = options.apiKey || process.env['OPENAI_API_KEY'];

    this.llm = new ChatOpenAI({
      modelName: 'gpt-4o-mini', // Use a smaller model for prompt optimization
      temperature: 0.7,
      ...(apiKey && { apiKey: apiKey }),
    });

    this.tool = new DallEAPIWrapper({
      n: options.numberOfImages, // Default to generating one image
      model: options.model,
      size: options.size,
      quality: options.quality,
      style: options.style,
      apiKey: options.apiKey,
    });
  }

  /**
   * Generate an optimized image prompt and simulate image generation
   * In a real implementation, this would call DALL-E API directly
   */
  async generateImage(prompt: string): Promise<GeneratedImage> {
    try {
      logger.info(`Optimizing image prompt: "${prompt.substring(0, 100)}..."`);

      // Use LLM to create an optimized DALL-E prompt
      const optimizedPrompt = await this.optimizeImagePrompt(prompt);

      // Simulate image generation using the DALL-E API wrapper
      logger.info(`Simulating DALL-E image generation for: "${optimizedPrompt}"`);

      const imageURL = await this.tool.invoke(optimizedPrompt);

      logger.debug('Image generation simulated successfully:', {
        originalPrompt: prompt,
        optimizedPrompt: optimizedPrompt,
        url: imageURL,
      });

      return {
        url: imageURL,
        prompt: prompt,
        revisedPrompt: optimizedPrompt,
      };
    } catch (error) {
      logger.error('Failed to generate image:', error);
      throw new Error(`Image generation failed: ${error}`);
    }
  }

  /**
   * Optimize a prompt for DALL-E image generation
   */
  private async optimizeImagePrompt(prompt: string): Promise<string> {
    const optimizationPrompt = `
        You are an expert at creating DALL-E image prompts. 
        Transform the following blog post image request into an optimized DALL-E prompt that will generate a high-quality, professional image suitable for a blog post.

        Guidelines:
        - Keep it concise but descriptive
        - Include style keywords like "professional", "clean", "modern"
        - Specify "digital art" or "illustration" as appropriate
        - Add quality indicators like "high resolution", "detailed"
        - Make it suitable for blog post headers or content

        Original prompt: ${prompt}

        Optimized DALL-E prompt:`;

    try {
      const response = await this.llm.invoke([new HumanMessage(optimizationPrompt)]);
      return response.content.toString().trim();
    } catch (error) {
      logger.warn('Failed to optimize prompt, using original:', error);
      return prompt;
    }
  }

  /**
   * Generate multiple images from multiple prompts
   */
  async generateImages(prompts: string[]): Promise<GeneratedImage[]> {
    const images: GeneratedImage[] = [];

    for (const prompt of prompts) {
      try {
        const image = await this.generateImage(prompt);
        images.push(image);
      } catch (error) {
        logger.warn(`Failed to generate image for prompt "${prompt}":`, error);
        // Continue with other images even if one fails
      }
    }

    return images;
  }

  /**
   * Create an optimized image prompt for blog posts
   */
  static createBlogImagePrompt(
    title: string,
    keywords?: string[],
    style: 'professional' | 'creative' | 'minimal' = 'professional',
  ): string {
    const keywordText = keywords && keywords.length > 0 ? `, ${keywords.join(', ')}` : '';

    const styleDescriptors = {
      professional: 'professional, clean, modern, high-quality illustration',
      creative: 'creative, artistic, vibrant, engaging illustration',
      minimal: 'minimal, clean, simple, elegant design',
    };

    return `${title}${keywordText}, ${styleDescriptors[style]}, blog post header image, digital art`;
  }

  /**
   * Create an image generator from PostPrompt configuration
   */
  static fromPostPrompt(postPrompt: BasePostPrompt): ImageGenerator {
    const options: ImageGenerationOptions = {
      model: 'dall-e-3',
      size: '1024x1024',
      quality: 'standard',
      style: 'natural',
      apiKey: postPrompt.apiKey || process.env['OPENAI_API_KEY'] || '',
      numberOfImages: 1, // Default to 1 image per heading
    };

    if (postPrompt.debug !== undefined) {
      options.debug = postPrompt.debug;
    }

    return new ImageGenerator(options);
  }
}
