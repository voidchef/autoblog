import axios, { AxiosInstance } from 'axios';
import httpStatus from 'http-status';
import ApiError from '../errors/ApiError';
import {
  IWordPressConfig,
  IWordPressPost,
  IWordPressPublishResponse,
  IWordPressMedia,
  IWordPressCategoryTag,
} from './wordpress.interfaces';
import logger from '../logger/logger';

class WordPressService {
  private client: AxiosInstance | null = null;
  private config: IWordPressConfig | null = null;

  /**
   * Initialize WordPress API client
   * @param {IWordPressConfig} config - WordPress configuration
   */
  initialize(config: IWordPressConfig): void {
    this.config = config;
    const auth = Buffer.from(`${config.username}:${config.applicationPassword}`).toString('base64');
    
    this.client = axios.create({
      baseURL: `${config.siteUrl}/wp-json/wp/v2`,
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  /**
   * Check if service is initialized
   */
  private ensureInitialized(): void {
    if (!this.client || !this.config) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'WordPress service not initialized');
    }
  }

  /**
   * Upload media to WordPress
   * @param {string} imageUrl - URL of the image to upload
   * @param {string} title - Title for the media
   * @returns {Promise<IWordPressMedia>}
   */
  async uploadMedia(imageUrl: string, title: string): Promise<IWordPressMedia> {
    this.ensureInitialized();

    try {
      // Download image
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(imageResponse.data);
      
      // Get file extension from URL or content type
      const contentType = imageResponse.headers['content-type'] || 'image/jpeg';
      const extension = contentType.split('/')[1] || 'jpg';
      
      // Upload to WordPress
      const response = await this.client!.post<IWordPressMedia>(
        '/media',
        imageBuffer,
        {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${extension}"`,
          },
        }
      );

      logger.info(`Image uploaded to WordPress: ${response.data.id}`);
      return response.data;
    } catch (error: any) {
      logger.error(`Failed to upload media to WordPress: ${error.message}`);
      throw new ApiError(httpStatus.BAD_REQUEST, `Failed to upload media: ${error.message}`);
    }
  }

  /**
   * Get or create category by name
   * @param {string} categoryName - Category name
   * @returns {Promise<number>} - Category ID
   */
  async getOrCreateCategory(categoryName: string): Promise<number> {
    this.ensureInitialized();

    try {
      // Search for existing category
      const response = await this.client!.get<IWordPressCategoryTag[]>('/categories', {
        params: { search: categoryName },
      });

      if (response.data.length > 0 && response.data[0]) {
        return response.data[0].id;
      }

      // Create new category
      const createResponse = await this.client!.post<IWordPressCategoryTag>('/categories', {
        name: categoryName,
      });

      logger.info(`Created WordPress category: ${createResponse.data.name} (${createResponse.data.id})`);
      return createResponse.data.id;
    } catch (error: any) {
      logger.error(`Failed to get/create category: ${error.message}`);
      throw new ApiError(httpStatus.BAD_REQUEST, `Failed to handle category: ${error.message}`);
    }
  }

  /**
   * Get or create tag by name
   * @param {string} tagName - Tag name
   * @returns {Promise<number>} - Tag ID
   */
  async getOrCreateTag(tagName: string): Promise<number> {
    this.ensureInitialized();

    try {
      // Search for existing tag
      const response = await this.client!.get<IWordPressCategoryTag[]>('/tags', {
        params: { search: tagName },
      });

      if (response.data.length > 0 && response.data[0]) {
        return response.data[0].id;
      }

      // Create new tag
      const createResponse = await this.client!.post<IWordPressCategoryTag>('/tags', {
        name: tagName,
      });

      logger.info(`Created WordPress tag: ${createResponse.data.name} (${createResponse.data.id})`);
      return createResponse.data.id;
    } catch (error: any) {
      logger.error(`Failed to get/create tag: ${error.message}`);
      throw new ApiError(httpStatus.BAD_REQUEST, `Failed to handle tag: ${error.message}`);
    }
  }

  /**
   * Publish a post to WordPress
   * @param {IWordPressPost} post - Post data
   * @returns {Promise<IWordPressPublishResponse>}
   */
  async publishPost(post: IWordPressPost): Promise<IWordPressPublishResponse> {
    this.ensureInitialized();

    try {
      const response = await this.client!.post<IWordPressPublishResponse>('/posts', post);
      logger.info(`Published post to WordPress: ${response.data.link}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      logger.error(`Failed to publish to WordPress: ${errorMessage}`);
      throw new ApiError(httpStatus.BAD_REQUEST, `Failed to publish to WordPress: ${errorMessage}`);
    }
  }

  /**
   * Update an existing post on WordPress
   * @param {number} postId - WordPress post ID
   * @param {Partial<IWordPressPost>} post - Post data to update
   * @returns {Promise<IWordPressPublishResponse>}
   */
  async updatePost(postId: number, post: Partial<IWordPressPost>): Promise<IWordPressPublishResponse> {
    this.ensureInitialized();

    try {
      const response = await this.client!.post<IWordPressPublishResponse>(`/posts/${postId}`, post);
      logger.info(`Updated WordPress post: ${response.data.link}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      logger.error(`Failed to update WordPress post: ${errorMessage}`);
      throw new ApiError(httpStatus.BAD_REQUEST, `Failed to update WordPress post: ${errorMessage}`);
    }
  }

  /**
   * Delete a post from WordPress
   * @param {number} postId - WordPress post ID
   * @returns {Promise<void>}
   */
  async deletePost(postId: number): Promise<void> {
    this.ensureInitialized();

    try {
      await this.client!.delete(`/posts/${postId}`, {
        params: { force: true }, // Permanently delete
      });
      logger.info(`Deleted WordPress post: ${postId}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      logger.error(`Failed to delete WordPress post: ${errorMessage}`);
      throw new ApiError(httpStatus.BAD_REQUEST, `Failed to delete WordPress post: ${errorMessage}`);
    }
  }
}

export default new WordPressService();
