import { PromptTemplate } from '@langchain/core/prompts';
import { PostImageService } from '../imageGen/postImageService';
import logger from '../logger/logger';
import { BasePostGenerator } from './baseGenerator';
import { OutlineGenerationError, ContentGenerationError, ValidationError } from './errors';
import { getMarkdownParser, AudienceIntentSchema, PostOutlineSchema } from './parser';
import {
  getSystemPrompt,
  getAudienceIntentPrompt,
  getOutlinePrompt,
  getIntroductionPrompt,
  getHeadingPrompt,
  getConclusionPrompt,
} from './prompt';
import { Heading, Post, PostOutline, AutoPostPrompt } from './types';
import { ChainBuilder, ContentFormatter, ValidationUtils } from './utils';

/**
 * Enhanced PostGenerator with improved architecture and error handling
 */
export class PostGenerator extends BasePostGenerator<AutoPostPrompt, Post> {
  constructor(postPrompt: AutoPostPrompt) {
    super(postPrompt);
  }

  /**
   * Generate a complete blog post
   */
  async generate(): Promise<Post> {
    this.debugLog('Starting post generation with config:', this.config);

    try {
      // Initialize system context
      const systemPrompt = await getSystemPrompt();
      await this.initializeSystemContext(systemPrompt);

      // Generate audience and intent if needed
      if (this.config.generate) {
        await this.generateAndSetAudienceIntent();
      }

      // Generate outline
      logger.info(`Generating outline for: ${this.config.topic}`);
      const outline = await this.generateOutline();

      // Generate content sections
      logger.info('Generating introduction');
      const introduction = await this.generateIntroduction();

      logger.info('Generating heading contents');
      const headingContents = await this.generateHeadingContents(outline);

      logger.info('Generating conclusion');
      const conclusion = await this.generateConclusion();

      // Generate images if requested
      const generatedImages = await this.generateImages(outline);

      // Assemble final post
      const content = this.assembleContent(introduction, headingContents, conclusion);

      const post: Post = {
        title: outline.title,
        content,
        seoTitle: outline.seoTitle,
        seoDescription: outline.seoDescription,
        slug: outline.slug,
        generatedImages,
      };

      logger.info('Post generation completed successfully');
      this.debugLog('Final memory state:', await this.getMemoryState());

      return post;
    } catch (error) {
      logger.error('Post generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate and set audience and intent
   */
  private async generateAndSetAudienceIntent(): Promise<void> {
    logger.info('Generating audience and intent');

    try {
      const template = await getAudienceIntentPrompt();
      const chain = ChainBuilder.buildStructuredChain(template, this.llmJson, AudienceIntentSchema, [
        'language',
        'topic',
      ]);

      const result = await chain.invoke({
        topic: this.config.topic,
        language: this.config.language,
        memory: await this.getMemoryState(),
      });

      if (!ValidationUtils.isValidAudienceIntent(result)) {
        throw new ValidationError('Invalid audience/intent response format');
      }

      this.config.audience = result['audience'] as string;
      this.config.intent = result['intent'] as string;

      logger.info(`Generated - Audience: ${result['audience']}, Intent: ${result['intent']}`);

      await this.saveToMemory(
        'Determine target audience and intent',
        `Audience: ${result['audience']}, Intent: ${result['intent']}`
      );
    } catch (error) {
      throw new OutlineGenerationError('Failed to generate audience and intent', error);
    }
  }

  /**
   * Generate post outline
   */
  private async generateOutline(): Promise<PostOutline> {
    try {
      const template = await getOutlinePrompt();
      const chain = ChainBuilder.buildStructuredChain(template, this.llmJson, PostOutlineSchema, [
        'language',
        'topic',
        'country',
        'audience',
        'intent',
      ]);

      let outline;
      try {
        outline = await chain.invoke({
          topic: this.config.topic,
          language: this.config.language,
          country: this.config.country,
          audience: this.config.audience || 'everyone',
          intent: this.config.intent || 'informative',
          memory: await this.getMemoryState(),
        });
      } catch (invokeError: any) {
        // Log API-specific errors with more detail
        logger.error('LLM API call failed during outline generation:', {
          error: invokeError.message,
          name: invokeError.name,
          status: invokeError.status,
          statusText: invokeError.statusText,
          response: invokeError.response,
        });
        throw invokeError;
      }

      if (!ValidationUtils.validateOutline(outline)) {
        logger.error('Invalid outline structure:', outline);
        throw new ValidationError('Invalid outline structure');
      }

      this.debugLog('Generated outline:', outline);

      // Save to memory
      const prompt = PromptTemplate.fromTemplate(template);
      const outlineMessage = await prompt.format({
        topic: this.config.topic,
        language: this.config.language,
        country: this.config.country,
        audience: this.config.audience || 'everyone',
        intent: this.config.intent || 'informative',
      });

      await this.saveToMemory(outlineMessage, ContentFormatter.outlineToMarkdown(outline));

      return outline as PostOutline;
    } catch (error) {
      // Log detailed error information
      if (error instanceof Error) {
        logger.error('Outline generation failed:', {
          message: error.message,
          name: error.name,
          config: {
            topic: this.config.topic,
            language: this.config.language,
            model: this.config.model,
          },
          cause: (error as any).cause,
        });
      }
      throw new OutlineGenerationError('Failed to generate outline', error);
    }
  }

  /**
   * Generate introduction
   */
  private async generateIntroduction(): Promise<string> {
    const template = await getIntroductionPrompt();
    return await this.generateContentSection(
      template,
      { topic: this.config.topic || '', language: this.config.language || 'en' },
      'Write the introduction'
    );
  }

  /**
   * Generate conclusion
   */
  private async generateConclusion(): Promise<string> {
    if (this.config.withConclusion === false) {
      logger.info('Skipping conclusion as per configuration');
      return '';
    }

    const template = await getConclusionPrompt();
    return await this.generateContentSection(
      template,
      { topic: this.config.topic || '', language: this.config.language || 'en' },
      'Write the conclusion'
    );
  }

  /**
   * Generate content for all headings
   */
  private async generateHeadingContents(outline: PostOutline): Promise<string> {
    return await ContentFormatter.buildMarkdownContent(
      outline.headings as unknown as Record<string, unknown>[],
      2,
      (heading) => this.generateHeadingContent(heading as unknown as Heading)
    );
  }

  /**
   * Generate content for a single heading
   */
  private async generateHeadingContent(heading: Heading): Promise<string> {
    logger.info(`Generating content for heading: ${heading.title}`);

    try {
      const template = await getHeadingPrompt();
      const parser = getMarkdownParser();

      const chain = ChainBuilder.buildContentChain(template, this.llmContent, parser, [
        'language',
        'headingTitle',
        'keywords',
        'formatInstructions',
      ]);

      const content = await chain.invoke({
        language: this.config.language,
        headingTitle: heading.title,
        keywords: heading.keywords?.join(', ') || '',
        formatInstructions: parser.getFormatInstructions(),
        memory: await this.getMemoryState(),
      });

      if (!content || content.trim() === '') {
        logger.warn(`No content generated for heading: ${heading.title}`);
        return `😿 No content generated with the model: ${this.config.model}`;
      }

      this.debugLog(`Generated content for heading: ${heading.title}`, { content });

      await this.saveToMemory(`Write content for heading: ${heading.title}`, content);

      return content;
    } catch (error) {
      throw new ContentGenerationError(`Failed to generate content for heading: ${heading.title}`, error);
    }
  }

  /**
   * Generic content section generator
   */
  private async generateContentSection(
    template: string,
    variables: Record<string, string>,
    memoryInput: string
  ): Promise<string> {
    try {
      const parser = getMarkdownParser();
      const inputKeys = [...Object.keys(variables), 'formatInstructions'];

      const chain = ChainBuilder.buildContentChain(template, this.llmContent, parser, inputKeys);

      const content = await chain.invoke({
        ...variables,
        formatInstructions: parser.getFormatInstructions(),
        memory: await this.getMemoryState(),
      });

      if (!content || content.trim() === '') {
        logger.warn('No content generated for section');
        return `😿 No content generated with the model: ${this.config.model}`;
      }

      this.debugLog('Generated section content', { memoryInput, content });

      await this.saveToMemory(memoryInput, content);

      return content;
    } catch (error) {
      throw new ContentGenerationError(`Failed to generate content section: ${memoryInput}`, error);
    }
  }

  /**
   * Generate images for the post
   */
  private async generateImages(outline: PostOutline): Promise<string[]> {
    if (!this.config.generateImages) {
      return [];
    }

    try {
      logger.info('Generating images for post');
      const imageService = new PostImageService(this.config);
      const generatedImages = await imageService.generatePostImages(outline);
      return PostImageService.imagesToUrls(generatedImages);
    } catch (error) {
      logger.error('Image generation failed:', error);
      return []; // Don't fail post generation due to image errors
    }
  }

  /**
   * Assemble final content from sections
   */
  private assembleContent(introduction: string, headingContents: string, conclusion: string): string {
    const parts = [introduction, headingContents];

    if (conclusion && conclusion.trim() !== '') {
      parts.push(conclusion);
    }

    return parts.join('\n\n').trim();
  }
}
