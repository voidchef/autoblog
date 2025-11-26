import axios, { AxiosInstance } from 'axios';
import httpStatus from 'http-status';
import ApiError from '../errors/ApiError';
import logger from '../logger/logger';
import {
  IMediumConfig,
  IMediumUser,
  IMediumPost,
  IMediumPublishResponse,
  IMediumApiResponse,
} from './medium.interfaces';

class MediumService {
  private client: AxiosInstance | null = null;
  private config: IMediumConfig | null = null;

  /**
   * Initialize Medium API client
   * @param {IMediumConfig} config - Medium configuration
   */
  initialize(config: IMediumConfig): void {
    this.config = config;

    this.client = axios.create({
      baseURL: 'https://api.medium.com/v1',
      headers: {
        Authorization: `Bearer ${config.integrationToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 30000,
    });
  }

  /**
   * Check if service is initialized
   */
  private ensureInitialized(): void {
    if (!this.client || !this.config) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Medium service not initialized');
    }
  }

  /**
   * Get authenticated user information
   * @returns {Promise<IMediumUser>}
   */
  async getUser(): Promise<IMediumUser> {
    this.ensureInitialized();

    try {
      const response = await this.client!.get<IMediumApiResponse<IMediumUser>>('/me');
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.[0]?.message || error.message;
      logger.error(`Failed to get Medium user: ${errorMessage}`);
      throw new ApiError(httpStatus.BAD_REQUEST, `Failed to get Medium user: ${errorMessage}`);
    }
  }

  /**
   * Convert HTML content to Markdown (basic conversion)
   * @param {string} html - HTML content
   * @returns {string} - Markdown content
   */
  private htmlToMarkdown(html: string): string {
    // Basic HTML to Markdown conversion
    const markdown = html
      // Remove script and style tags
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      // Convert headings
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
      .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
      .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
      // Convert links
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      // Convert images
      .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)')
      .replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)')
      // Convert bold
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      // Convert italic
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
      // Convert lists
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
      .replace(/<\/ul>/gi, '\n')
      .replace(/<\/ol>/gi, '\n')
      .replace(/<ul[^>]*>/gi, '')
      .replace(/<ol[^>]*>/gi, '')
      // Convert paragraphs
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      // Convert line breaks
      .replace(/<br\s*\/?>/gi, '\n')
      // Remove remaining HTML tags
      .replace(/<[^>]+>/g, '')
      // Decode HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      // Clean up extra whitespace
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return markdown;
  }

  /**
   * Publish a post to Medium
   * @param {IMediumPost} post - Post data
   * @returns {Promise<IMediumPublishResponse>}
   */
  async publishPost(post: IMediumPost): Promise<IMediumPublishResponse> {
    this.ensureInitialized();

    try {
      // Get user ID first
      const user = await this.getUser();

      // Convert content if needed
      let content = post.content;
      const contentFormat = post.contentFormat;

      // If content is HTML and format is markdown, convert it
      if (contentFormat === 'markdown' && post.content.includes('<')) {
        content = this.htmlToMarkdown(post.content);
      }

      const postData = {
        title: post.title,
        content,
        contentFormat,
        tags: post.tags || [],
        canonicalUrl: post.canonicalUrl,
        publishStatus: post.publishStatus || 'draft',
        license: post.license || 'all-rights-reserved',
        notifyFollowers: post.notifyFollowers !== undefined ? post.notifyFollowers : false,
      };

      const response = await this.client!.post<IMediumApiResponse<IMediumPublishResponse>>(
        `/users/${user.id}/posts`,
        postData
      );

      logger.info(`Published post to Medium: ${response.data.data.url}`);
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.[0]?.message || error.message;
      logger.error(`Failed to publish to Medium: ${errorMessage}`);
      throw new ApiError(httpStatus.BAD_REQUEST, `Failed to publish to Medium: ${errorMessage}`);
    }
  }

  /**
   * Note: Medium API does not support updating or deleting posts
   * These operations can only be done through the Medium web interface
   */
}

export default new MediumService();
