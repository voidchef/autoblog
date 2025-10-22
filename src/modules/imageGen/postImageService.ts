import logger from '../logger/logger';
import { Heading, PostOutline, AutoPostPrompt, TemplatePostPrompt } from '../postGen/types';
import { ImageGenerator, GeneratedImage } from './imageGenerator';

export class PostImageService {
  private imageGenerator: ImageGenerator;

  constructor(
    private postPrompt: AutoPostPrompt | TemplatePostPrompt,
    imageGenerator?: ImageGenerator
  ) {
    this.imageGenerator = imageGenerator || ImageGenerator.fromPostPrompt(postPrompt);
  }

  /**
   * Generate images for an entire post based on outline
   */
  async generatePostImages(postOutline: PostOutline): Promise<GeneratedImage[]> {
    const images: GeneratedImage[] = [];

    // Generate main image for the post title
    try {
      logger.info('Generating main image for topic: ' + postOutline.title);
      const mainImagePrompt = ImageGenerator.createBlogImagePrompt(postOutline.title, [], 'professional');
      const mainImage = await this.imageGenerator.generateImage(mainImagePrompt);
      images.push(mainImage);
    } catch (error) {
      logger.warn('Failed to generate main image:', error);
    }

    // Generate images for each heading
    if (this.shouldGenerateHeadingImages()) {
      const headingImages = await this.generateHeadingImages(postOutline.headings);
      images.push(...headingImages);
    }

    return images;
  }

  /**
   * Generate images for headings recursively
   */
  async generateHeadingImages(headings: Heading[]): Promise<GeneratedImage[]> {
    const images: GeneratedImage[] = [];
    const imagesPerHeading = this.getImagesPerHeading();

    for (const heading of headings) {
      try {
        logger.info(`Generating ${imagesPerHeading} image(s) for heading: ${heading.title}`);

        for (let i = 0; i < imagesPerHeading; i++) {
          const imagePrompt = ImageGenerator.createBlogImagePrompt(heading.title, heading.keywords, 'professional');

          const image = await this.imageGenerator.generateImage(imagePrompt);
          images.push(image);
        }
      } catch (error) {
        logger.warn(`Failed to generate image for heading "${heading.title}":`, error);
      }

      // Recursively generate images for sub-headings
      if (heading.headings && heading.headings.length > 0) {
        const subHeadingImages = await this.generateHeadingImages(heading.headings);
        images.push(...subHeadingImages);
      }
    }

    return images;
  }

  /**
   * Generate images for template-based posts
   */
  async generateTemplateImages(title: string, content: string): Promise<GeneratedImage[]> {
    const images: GeneratedImage[] = [];

    try {
      // Generate main image for the post title
      logger.info('Generating main image for template post: ' + title);
      const mainImagePrompt = ImageGenerator.createBlogImagePrompt(title, [], 'professional');
      const mainImage = await this.imageGenerator.generateImage(mainImagePrompt);
      images.push(mainImage);

      // Generate additional images based on content sections
      if (this.shouldGenerateHeadingImages()) {
        const imagesPerSection = this.getImagesPerSection();
        const sections = this.extractContentSections(content);
        for (let i = 0; i < Math.min(sections.length, imagesPerSection); i++) {
          const section = sections[i];
          if (section) {
            const imagePrompt = this.createContentImagePrompt(section);
            const image = await this.imageGenerator.generateImage(imagePrompt);
            images.push(image);
          }
        }
      }
    } catch (error) {
      logger.warn('Failed to generate template images:', error);
    }

    return images;
  }

  /**
   * Generate an optimized image prompt for template sections
   */
  async generateTemplateImagePrompt(templatePrompt: string): Promise<string> {
    // Create a simplified prompt for the template section
    const cleanPrompt = templatePrompt.replace(/\{[^}]*\}/g, '').trim();
    return ImageGenerator.createBlogImagePrompt(cleanPrompt, [], 'professional');
  }

  /**
   * Extract content sections for image generation
   */
  private extractContentSections(content: string): string[] {
    // Split content by headings or paragraphs
    const sections = content.split(/#{1,6}\s+/).filter((section) => section.trim().length > 0);
    return sections.slice(0, 5); // Limit to first 5 sections
  }

  /**
   * Create image prompt based on content section
   */
  private createContentImagePrompt(section: string): string {
    // Extract the first 100 characters for the prompt
    const excerpt = section.substring(0, 100).trim();
    return ImageGenerator.createBlogImagePrompt(excerpt, [], 'professional');
  }

  /**
   * Get number of images per heading from prompt
   */
  private getImagesPerHeading(): number {
    if ('imagesPerHeading' in this.postPrompt) {
      return this.postPrompt.imagesPerHeading || 1;
    }
    return 1;
  }

  /**
   * Get number of images per section from prompt
   */
  private getImagesPerSection(): number {
    if ('imagesPerSection' in this.postPrompt) {
      return this.postPrompt.imagesPerSection || 1;
    }
    return 1;
  }

  /**
   * Check if heading images should be generated
   */
  private shouldGenerateHeadingImages(): boolean {
    if ('generateHeadingImages' in this.postPrompt) {
      return this.postPrompt.generateHeadingImages || false;
    }
    return false;
  }

  /**
   * Convert GeneratedImage array to URLs array
   */
  static imagesToUrls(images: GeneratedImage[]): string[] {
    return images.map((img) => img.url);
  }
}
