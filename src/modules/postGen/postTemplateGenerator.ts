import { readFile } from 'fs/promises';
import { PromptTemplate } from '@langchain/core/prompts';
import { PostImageService } from '../imageGen/postImageService';
import logger from '../logger/logger';
import { BasePostGenerator } from './baseGenerator';
import { ContentGenerationError, ValidationError } from './errors';
import { SeoInfoSchema, getParser } from './parser';
import { getSeoInfoPrompt } from './prompt';
import { Template } from './template';
import { TemplatePostPrompt, TemplatePost } from './types';
import { ChainBuilder, ValidationUtils } from './utils';

/**
 * Enhanced PostTemplateGenerator with improved architecture
 */
export class PostTemplateGenerator extends BasePostGenerator<TemplatePostPrompt, TemplatePost> {
  constructor(postPrompt: TemplatePostPrompt) {
    super(postPrompt);
  }

  /**
   * Generate a blog post from template
   */
  async generate(): Promise<TemplatePost> {
    logger.info(`Generating post from template: ${this.config.templateFile}`);
    this.debugLog('Template generation config:', this.config);

    try {
      // Read and parse template
      const templateContent = await this.readTemplate();
      const template = new Template(templateContent);

      // Initialize system context
      const systemPrompt = await this.buildSystemPrompt(template);
      await this.initializeSystemContext(systemPrompt);

      // Generate content sections
      const contents = await this.generateTemplateContents(template);

      // Build final content
      const content = template.buildContent(contents);

      // Generate SEO information
      const { h1, seoTitle, seoDescription, slug } = await this.generateSeoInfo(content);

      // Generate images if requested
      const generatedImages = await this.generateImages(h1, content);

      const post: TemplatePost = {
        title: h1,
        content,
        seoTitle,
        seoDescription,
        slug,
        generatedImages,
      };

      logger.info('Template post generation completed successfully');
      this.debugLog('Final memory state:', await this.getMemoryState());

      return post;
    } catch (error) {
      logger.error('Template post generation failed:', error);
      throw error;
    }
  }

  /**
   * Build system prompt from template
   */
  private async buildSystemPrompt(template: Template): Promise<string> {
    const systemPromptTemplate = template.getSystemPrompt();

    if (!systemPromptTemplate) {
      return 'Write professional, engaging blog post content based on the provided information.';
    }

    const prompt = PromptTemplate.fromTemplate(systemPromptTemplate);
    return await prompt.format(this.config.input);
  }

  /**
   * Generate all template content sections
   */
  private async generateTemplateContents(template: Template): Promise<string[]> {
    const prompts = template.getPrompts();
    const contents: string[] = [];

    logger.info(`Generating ${prompts.length} template sections`);

    for (const [index, promptConfig] of prompts.entries()) {
      if (promptConfig.type === 'i') {
        // Handle image placeholder
        const imageContent = await this.handleImagePlaceholder(index);
        contents.push(imageContent);
      } else if (promptConfig.type === 'c') {
        // Generate content
        logger.info(`Generating content for section ${index + 1}/${prompts.length}`);
        const content = await this.generateTemplateContent(promptConfig.prompt);
        contents.push(content);
      }
    }

    return contents;
  }

  /**
   * Generate content for a template section
   */
  private async generateTemplateContent(promptText: string): Promise<string> {
    try {
      const parser = getParser(this.config);
      const promptWithInstructions = `${promptText}\n{formatInstructions}\n`;

      // Extract input variables from template
      const inputVariables = this.extractInputVariables();
      const inputKeys = [...Object.keys(inputVariables), 'formatInstructions'];

      const chain = ChainBuilder.buildContentChain(promptWithInstructions, this.llmContent, parser, inputKeys);

      const content = await chain.invoke({
        ...inputVariables,
        formatInstructions: parser.getFormatInstructions(),
        memory: await this.getMemoryState(),
      });

      if (!content || content.trim() === '') {
        logger.warn('No content generated for template section');
        return `😿 No content generated with the model: ${this.config.model}`;
      }

      await this.saveToMemory(promptText, content);

      return content;
    } catch (error) {
      throw new ContentGenerationError('Failed to generate template content section', error);
    }
  }

  /**
   * Handle image placeholder in template
   */
  private async handleImagePlaceholder(sectionIndex: number): Promise<string> {
    if (!this.config.generateImages) {
      logger.debug(`Skipping image for section ${sectionIndex} (images disabled)`);
      return '';
    }

    try {
      logger.info(`Generating image for template section ${sectionIndex + 1}`);
      const imageService = new PostImageService(this.config);

      // Generate a generic image prompt for this section
      const imagePrompt = await imageService.generateTemplateImagePrompt(`Section ${sectionIndex + 1} illustration`);

      return `![Generated Image](${imagePrompt})`;
    } catch (error) {
      logger.warn(`Failed to generate image for section ${sectionIndex + 1}:`, error);
      return '';
    }
  }

  /**
   * Generate SEO information from content
   */
  private async generateSeoInfo(
    content: string
  ): Promise<{ h1: string; seoTitle: string; seoDescription: string; slug: string }> {
    try {
      logger.info('Generating SEO information');

      const template = await getSeoInfoPrompt();
      const chain = ChainBuilder.buildStructuredChain(template, this.llmJson, SeoInfoSchema, ['content']);

      const seoInfo = await chain.invoke({
        content,
        memory: await this.getMemoryState(),
      });

      if (!ValidationUtils.validateSeoInfo(seoInfo)) {
        throw new ValidationError('Invalid SEO info structure');
      }

      await this.saveToMemory('Generate SEO information', JSON.stringify(seoInfo, null, 2));

      return seoInfo as {
        h1: string;
        seoTitle: string;
        seoDescription: string;
        slug: string;
      };
    } catch (error) {
      throw new ContentGenerationError('Failed to generate SEO information', error);
    }
  }

  /**
   * Generate images for template post
   */
  private async generateImages(title: string, content: string): Promise<string[]> {
    if (!this.config.generateImages) {
      return [];
    }

    try {
      logger.info('Generating images for template post');
      const imageService = new PostImageService(this.config);
      const generatedImages = await imageService.generateTemplateImages(title, content);
      return PostImageService.imagesToUrls(generatedImages);
    } catch (error) {
      logger.error('Template image generation failed:', error);
      return [];
    }
  }

  /**
   * Read template file
   */
  private async readTemplate(): Promise<string> {
    if (!this.config.templateFile) {
      throw new ValidationError('Template file path is required', 'templateFile');
    }

    try {
      return await readFile(this.config.templateFile, 'utf-8');
    } catch (error) {
      throw new ContentGenerationError(`Failed to read template file: ${this.config.templateFile}`, error);
    }
  }

  /**
   * Extract input variables from config
   */
  private extractInputVariables(): Record<string, string> {
    const variables: Record<string, string> = {};

    for (const [key, value] of Object.entries(this.config.input)) {
      if (typeof value === 'string') {
        variables[key] = value;
      }
    }

    return variables;
  }
}
