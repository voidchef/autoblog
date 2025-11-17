/**
 * Type definitions for image generation module
 */

export type ImageModel = 'dall-e-2' | 'dall-e-3';
export type ImageSize = '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
export type ImageQuality = 'standard' | 'hd';
export type ImageStyle = 'vivid' | 'natural';
export type BlogImageStyle = 'professional' | 'creative' | 'minimal';

export interface ImageGenerationConfig {
  model: ImageModel;
  apiKey: string;
  size: ImageSize;
  quality: ImageQuality;
  style: ImageStyle;
  numberOfImages: number;
  debug?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  revisedPrompt?: string;
  metadata?: {
    model: ImageModel;
    size: ImageSize;
    quality: ImageQuality;
    style: ImageStyle;
    timestamp: Date;
  };
}

export interface IImageProvider {
  generateImage(prompt: string): Promise<string>;
  supports(model: ImageModel): boolean;
}

export interface IPromptOptimizer {
  optimize(prompt: string, context?: PromptContext): Promise<string>;
}

export interface PromptContext {
  title?: string;
  keywords?: string[];
  style?: BlogImageStyle;
  targetAudience?: string;
}

export interface ImageGenerationResult {
  success: boolean;
  image?: GeneratedImage;
  error?: Error;
}

export interface BatchImageGenerationResult {
  successful: GeneratedImage[];
  failed: Array<{ prompt: string; error: Error }>;
  totalRequested: number;
}
