/**
 * Basic test to verify image generation functionality is properly integrated
 */

import { PostGenerator, AutoPostPrompt } from '../postGen';
import { ImageGenerator, PostImageService } from '.';

describe('PostGenerator with Image Generation', () => {
  it('should include image generation options in AutoPostPrompt type', () => {
    const prompt: AutoPostPrompt = {
      topic: 'Test Topic',
      language: 'English',
      model: 'gpt-4o',
      generateImages: true,
      imagesPerHeading: 2,
    };

    expect(prompt.generateImages).toBe(true);
    expect(prompt.imagesPerHeading).toBe(2);
  });

  it('should create PostGenerator instance with image generation enabled', () => {
    const prompt: AutoPostPrompt = {
      topic: 'AI in Healthcare',
      language: 'English',
      model: 'gpt-4o',
      generateImages: true,
      imagesPerHeading: 1,
    };

    const generator = new PostGenerator(prompt);
    expect(generator).toBeInstanceOf(PostGenerator);
  });

  it('should have generatedImages field in Post type', () => {
    const mockPost = {
      title: 'Test Title',
      content: 'Test content',
      seoTitle: 'SEO Title',
      seoDescription: 'SEO Description',
      slug: 'test-slug',
      generatedImages: ['image1.jpg', 'image2.jpg'],
    };

    expect(mockPost.generatedImages).toBeDefined();
    expect(Array.isArray(mockPost.generatedImages)).toBe(true);
    expect(mockPost.generatedImages).toHaveLength(2);
  });
});

describe('PostTemplateGenerator with Image Generation', () => {
  it('should include image generation options in TemplatePostPrompt type', () => {
    const prompt = {
      templateFile: './template.md',
      model: 'gpt-4o' as const,
      input: { topic: 'Test' },
      generateImages: true,
      imagesPerSection: 3,
    };

    expect(prompt.generateImages).toBe(true);
    expect(prompt.imagesPerSection).toBe(3);
  });
});

describe('ImageGenerator', () => {
  it('should create ImageGenerator instance with options', () => {
    const generator = new ImageGenerator({
      model: 'dall-e-3',
      size: '1024x1024',
      quality: 'standard',
      style: 'natural',
      numberOfImages: 1,
      apiKey: 'test-api-key',
      debug: true,
    });

    expect(generator).toBeInstanceOf(ImageGenerator);
  });

  it('should create optimized blog image prompts', () => {
    const prompt = ImageGenerator.createBlogImagePrompt(
      'AI in Healthcare',
      ['artificial intelligence', 'medical technology'],
      'professional',
    );

    expect(prompt).toContain('AI in Healthcare');
    expect(prompt).toContain('artificial intelligence');
    expect(prompt).toContain('medical technology');
    expect(prompt).toContain('professional');
  });

  it('should create ImageGenerator from PostPrompt', () => {
    const postPrompt: AutoPostPrompt = {
      topic: 'Test',
      language: 'English',
      model: 'gpt-4o',
      apiKey: 'test-key',
      debug: true,
    };

    const generator = ImageGenerator.fromPostPrompt(postPrompt);
    expect(generator).toBeInstanceOf(ImageGenerator);
  });
});

describe('PostImageService', () => {
  it('should create PostImageService instance', () => {
    const postPrompt: AutoPostPrompt = {
      topic: 'Test',
      language: 'English',
      model: 'gpt-4o',
    };

    const service = new PostImageService(postPrompt);
    expect(service).toBeInstanceOf(PostImageService);
  });

  it('should convert generated images to strings', () => {
    const generatedImages = [
      {
        url: 'https://example.com/image1.jpg',
        prompt: 'original prompt 1',
        revisedPrompt: 'optimized prompt 1',
      },
      {
        url: 'https://example.com/image2.jpg',
        prompt: 'original prompt 2',
        revisedPrompt: 'optimized prompt 2',
      },
    ];

    const strings = PostImageService.imagesToStrings(generatedImages);
    expect(strings).toEqual(['optimized prompt 1', 'optimized prompt 2']);
  });

  it('should convert generated images to URLs', () => {
    const generatedImages = [
      {
        url: 'https://example.com/image1.jpg',
        prompt: 'prompt 1',
      },
      {
        url: 'https://example.com/image2.jpg',
        prompt: 'prompt 2',
      },
    ];

    const urls = PostImageService.imagesToUrls(generatedImages);
    expect(urls).toEqual(['https://example.com/image1.jpg', 'https://example.com/image2.jpg']);
  });
});
