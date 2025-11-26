import logger from '../logger/logger';
import { Heading, PostOutline, AutoPostPrompt, TemplatePostPrompt } from '../postGen/types';
import { ImageGenerationError } from './errors';
import { ImageGenerator } from './imageGenerator';
import { GeneratedImage, PromptContext } from './types';

/**
 * Configuration for post image generation
 */
interface PostImageConfig {
  generateMainImage: boolean;
  generateHeadingImages: boolean;
  imagesPerHeading: number;
  imagesPerSection: number;
  maxConcurrency: number;
  imageStyle: 'professional' | 'creative' | 'minimal';
}

/**
 * Enhanced service for generating images for blog posts
 */
export class PostImageService {
  private imageGenerator: ImageGenerator;
  private config: PostImageConfig;

  constructor(
    private postPrompt: AutoPostPrompt | TemplatePostPrompt,
    imageGenerator?: ImageGenerator
  ) {
    this.imageGenerator = imageGenerator || ImageGenerator.fromPostPrompt(postPrompt);
    this.config = this.buildConfig(postPrompt);
  }

  /**
   * Generate all images for a post based on outline
   */
  async generatePostImages(postOutline: PostOutline): Promise<GeneratedImage[]> {
    const images: GeneratedImage[] = [];

    try {
      // Generate main image
      if (this.config.generateMainImage) {
        const mainImage = await this.generateMainImage(postOutline.title);
        if (mainImage) {
          images.push(mainImage);
        }
      }

      // Generate heading images
      if (this.config.generateHeadingImages && postOutline.headings.length > 0) {
        const headingImages = await this.generateHeadingImages(postOutline.headings);
        images.push(...headingImages);
      }

      logger.info(`Generated ${images.length} images for post`);
      return images;
    } catch (error) {
      logger.error('Failed to generate post images:', error);
      throw new ImageGenerationError(
        `Post image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      );
    }
  }

  /**
   * Generate main image for post title
   */
  async generateMainImage(title: string, keywords: string[] = []): Promise<GeneratedImage | null> {
    try {
      logger.info(`Generating main image for: ${title}`);

      const prompt = ImageGenerator.createBlogImagePrompt(title, keywords, this.config.imageStyle);
      const context: PromptContext = {
        title,
        keywords,
        style: this.config.imageStyle,
      };

      const image = await this.imageGenerator.generateImage(prompt, context);
      return image;
    } catch (error) {
      logger.warn('Failed to generate main image:', error);
      return null; // Don't fail the entire process for one image
    }
  }

  /**
   * Generate images for headings with batch processing
   */
  async generateHeadingImages(headings: Heading[]): Promise<GeneratedImage[]> {
    const prompts = this.buildHeadingPrompts(headings);

    if (prompts.length === 0) {
      return [];
    }

    logger.info(`Generating ${prompts.length} images for headings`);

    try {
      const result = await this.imageGenerator.generateImages(
        prompts.map((p) => p.prompt),
        {
          concurrency: this.config.maxConcurrency,
          stopOnError: false,
          context: {
            style: this.config.imageStyle,
          },
        }
      );

      // Log failures
      if (result.failed.length > 0) {
        logger.warn(`${result.failed.length} heading images failed to generate`);
        result.failed.forEach((f) => {
          logger.debug(`Failed prompt: "${f.prompt.substring(0, 50)}..."`, f.error);
        });
      }

      return result.successful;
    } catch (error) {
      logger.error('Batch heading image generation failed:', error);
      return [];
    }
  }

  /**
   * Build prompts for all headings recursively
   */
  private buildHeadingPrompts(
    headings: Heading[],
    prompts: Array<{ prompt: string; heading: Heading }> = []
  ): Array<{ prompt: string; heading: Heading }> {
    for (const heading of headings) {
      // Generate images based on configuration
      for (let i = 0; i < this.config.imagesPerHeading; i++) {
        const prompt = ImageGenerator.createBlogImagePrompt(
          heading.title,
          heading.keywords || [],
          this.config.imageStyle
        );
        prompts.push({ prompt, heading });
      }

      // Process sub-headings recursively
      if (heading.headings && heading.headings.length > 0) {
        this.buildHeadingPrompts(heading.headings, prompts);
      }
    }

    return prompts;
  }

  /**
   * Generate images for template-based posts
   */
  async generateTemplateImages(title: string, content: string): Promise<GeneratedImage[]> {
    const images: GeneratedImage[] = [];

    try {
      // Generate main image
      if (this.config.generateMainImage) {
        const mainImage = await this.generateMainImage(title);
        if (mainImage) {
          images.push(mainImage);
        }
      }

      // Generate section images
      if (this.config.generateHeadingImages) {
        const sectionImages = await this.generateSectionImages(content);
        images.push(...sectionImages);
      }

      logger.info(`Generated ${images.length} images for template post`);
      return images;
    } catch (error) {
      logger.error('Failed to generate template images:', error);
      throw new ImageGenerationError(
        `Template image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      );
    }
  }

  /**
   * Generate images for content sections
   */
  private async generateSectionImages(content: string): Promise<GeneratedImage[]> {
    const sections = this.extractContentSections(content);
    const prompts = sections.slice(0, this.config.imagesPerSection).map((section) => this.createSectionPrompt(section));

    if (prompts.length === 0) {
      return [];
    }

    logger.info(`Generating ${prompts.length} images for content sections`);

    try {
      const result = await this.imageGenerator.generateImages(prompts, {
        concurrency: this.config.maxConcurrency,
        stopOnError: false,
        context: { style: this.config.imageStyle },
      });

      return result.successful;
    } catch (error) {
      logger.error('Section image generation failed:', error);
      return [];
    }
  }

  /**
   * Extract meaningful sections from content
   */
  private extractContentSections(content: string): string[] {
    // Split by markdown headings
    const headingRegex = /#{1,6}\s+(.+)/g;
    const matches = Array.from(content.matchAll(headingRegex));

    if (matches.length > 0) {
      return matches.map((m) => m[1]?.trim() || '').filter((s) => s.length > 0);
    }

    // Fallback: split by paragraphs and take first sentence
    const paragraphs = content.split(/\n\n+/);
    return paragraphs
      .map((p) => {
        const sentences = p.split(/[.!?]+/);
        return sentences[0]?.trim() || '';
      })
      .filter((s) => s.length > 20)
      .slice(0, 5);
  }

  /**
   * Create image prompt from content section
   */
  private createSectionPrompt(section: string): string {
    // Clean and truncate section
    const cleaned = section
      .replace(/[#*_`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const excerpt = cleaned.substring(0, 150);
    return ImageGenerator.createBlogImagePrompt(excerpt, [], this.config.imageStyle);
  }

  /**
   * Generate optimized template image prompt
   */
  async generateTemplateImagePrompt(templatePrompt: string): Promise<string> {
    const cleaned = templatePrompt.replace(/\{[^}]*\}/g, '').trim();
    return ImageGenerator.createBlogImagePrompt(cleaned, [], this.config.imageStyle);
  }

  /**
   * Build configuration from post prompt
   */
  private buildConfig(postPrompt: AutoPostPrompt | TemplatePostPrompt): PostImageConfig {
    const hasHeadingImages = 'generateHeadingImages' in postPrompt ? postPrompt.generateHeadingImages : false;
    const imagesPerHeading = 'imagesPerHeading' in postPrompt ? postPrompt.imagesPerHeading : 1;
    const imagesPerSection = 'imagesPerSection' in postPrompt ? postPrompt.imagesPerSection : 1;

    return {
      generateMainImage: true,
      generateHeadingImages: hasHeadingImages || false,
      imagesPerHeading: imagesPerHeading || 1,
      imagesPerSection: imagesPerSection || 1,
      maxConcurrency: 3,
      imageStyle: 'professional',
    };
  }

  /**
   * Convert GeneratedImage array to URLs (backward compatibility)
   */
  static imagesToUrls(images: GeneratedImage[]): string[] {
    return images.map((img) => img.url);
  }

  /**
   * Update service configuration
   */
  updateConfig(config: Partial<PostImageConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<PostImageConfig> {
    return { ...this.config };
  }
}
