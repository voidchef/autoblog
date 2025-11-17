import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { HumanMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import logger from '../logger/logger';
import { PromptOptimizationError } from './errors';
import { IPromptOptimizer, PromptContext, BlogImageStyle } from './types';

/**
 * Service for optimizing image generation prompts using LLM
 */
export class PromptOptimizer implements IPromptOptimizer {
  private llm: BaseChatModel;
  private cache: Map<string, string> = new Map();

  constructor(apiKey?: string, options?: { useCache?: boolean; cacheSize?: number }) {
    const effectiveApiKey = apiKey || process.env['OPENAI_API_KEY'];

    this.llm = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.7,
      ...(effectiveApiKey && { apiKey: effectiveApiKey }),
    });

    // Limit cache size to prevent memory issues
    if (options?.useCache && options?.cacheSize) {
      this.setupCacheLimit(options.cacheSize);
    }
  }

  /**
   * Optimize a prompt for DALL-E image generation
   */
  async optimize(prompt: string, context?: PromptContext): Promise<string> {
    const cacheKey = this.getCacheKey(prompt, context);

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      logger.debug('Using cached optimized prompt');
      return cached;
    }

    try {
      const optimizationPrompt = this.buildOptimizationPrompt(prompt, context);
      const response = await this.llm.invoke([new HumanMessage(optimizationPrompt)]);
      const optimized = response.content.toString().trim();

      // Cache the result
      this.cache.set(cacheKey, optimized);

      return optimized;
    } catch (error) {
      logger.warn('Failed to optimize prompt, using original:', error);
      throw new PromptOptimizationError(
        `Failed to optimize prompt: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      );
    }
  }

  /**
   * Build the optimization prompt with context
   */
  private buildOptimizationPrompt(prompt: string, context?: PromptContext): string {
    const styleGuides = this.getStyleGuidelines(context?.style);
    const keywordText = context?.keywords?.length ? `Keywords to emphasize: ${context.keywords.join(', ')}` : '';
    const audienceText = context?.targetAudience ? `Target audience: ${context.targetAudience}` : '';

    return `
You are an expert at creating DALL-E image prompts. 
Transform the following request into an optimized DALL-E prompt that will generate a high-quality, professional image suitable for a blog post.

Guidelines:
- Keep it concise but descriptive (max 200 characters)
- Include style keywords: ${styleGuides}
- Specify "digital art" or "illustration" as appropriate
- Add quality indicators like "high resolution", "detailed"
- Make it suitable for blog post headers or content
- Avoid any text or typography in the image

Original prompt: ${prompt}
${keywordText}
${audienceText}

Optimized DALL-E prompt (just the prompt, no explanations):`.trim();
  }

  /**
   * Get style guidelines based on blog image style
   */
  private getStyleGuidelines(style?: BlogImageStyle): string {
    const styleDescriptors = {
      professional: 'professional, clean, modern, high-quality',
      creative: 'creative, artistic, vibrant, engaging',
      minimal: 'minimal, clean, simple, elegant',
    };

    return styleDescriptors[style || 'professional'];
  }

  /**
   * Generate cache key for prompt and context
   */
  private getCacheKey(prompt: string, context?: PromptContext): string {
    const contextStr = context
      ? JSON.stringify({
          keywords: context.keywords?.sort(),
          style: context.style,
          audience: context.targetAudience,
        })
      : '';
    return `${prompt}:${contextStr}`;
  }

  /**
   * Setup automatic cache cleanup when size limit is reached
   */
  private setupCacheLimit(maxSize: number): void {
    const originalSet = this.cache.set.bind(this.cache);
    this.cache.set = (key: string, value: string) => {
      if (this.cache.size >= maxSize) {
        // Remove oldest entry (first entry in Map)
        const firstKey = this.cache.keys().next().value;
        if (firstKey) {
          this.cache.delete(firstKey);
        }
      }
      return originalSet(key, value);
    };
  }

  /**
   * Clear the optimization cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}
