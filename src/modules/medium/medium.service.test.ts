import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import axios from 'axios';
import { IMediumConfig, IMediumPost } from './medium.interfaces';
import mediumService from './medium.service';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Medium Service', () => {
  const mockConfig: IMediumConfig = {
    integrationToken: 'test-integration-token',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock axios.create to return a mock client
    mockedAxios.create = jest.fn().mockReturnValue({
      get: jest.fn<(...args: any[]) => Promise<any>>(),
      post: jest.fn<(...args: any[]) => Promise<any>>(),
      put: jest.fn<(...args: any[]) => Promise<any>>(),
      delete: jest.fn<(...args: any[]) => Promise<any>>(),
    }) as any;
  });

  describe('initialize', () => {
    it('should initialize with valid configuration', () => {
      expect(() => mediumService.initialize(mockConfig)).not.toThrow();
    });
  });

  describe('publishPost', () => {
    it('should successfully publish a post with HTML content', async () => {
      const mockPost: IMediumPost = {
        title: 'Test Blog Post',
        content: '<p>This is <strong>test</strong> content</p>',
        contentFormat: 'html',
        publishStatus: 'public',
        tags: ['test', 'blog'],
      };

      const mockUserResponse = {
        data: { data: { id: 'user123' } },
      };
      const mockPostResponse = {
        data: {
          data: {
            id: 'post123',
            url: 'https://medium.com/@testuser/test-blog-post-abc123',
            title: 'Test Blog Post',
            authorId: 'user123',
            publishStatus: 'public',
          },
        },
      };

      const mockClient = {
        get: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue(mockUserResponse),
        post: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue(mockPostResponse),
        put: jest.fn<(...args: any[]) => Promise<any>>(),
        delete: jest.fn<(...args: any[]) => Promise<any>>(),
      };

      mockedAxios.create = jest.fn().mockReturnValue(mockClient) as any;
      mediumService.initialize(mockConfig);

      const result = await mediumService.publishPost(mockPost);

      expect(result).toHaveProperty('id', 'post123');
      expect(result).toHaveProperty('url');
      expect(mockClient.get).toHaveBeenCalled();
      expect(mockClient.post).toHaveBeenCalled();
    });

    it('should handle markdown content correctly', async () => {
      const markdownPost: IMediumPost = {
        title: 'Markdown Post',
        content: '# Heading\n\nThis is **markdown** content',
        contentFormat: 'markdown',
        publishStatus: 'draft',
      };

      const mockUserResponse = {
        data: { data: { id: 'user123' } },
      };
      const mockPostResponse = {
        data: {
          data: {
            id: 'post123',
            url: 'https://medium.com/@testuser/markdown-post',
            title: 'Markdown Post',
            authorId: 'user123',
            publishStatus: 'draft',
          },
        },
      };

      const mockClient = {
        get: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue(mockUserResponse),
        post: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue(mockPostResponse),
        put: jest.fn<(...args: any[]) => Promise<any>>(),
        delete: jest.fn<(...args: any[]) => Promise<any>>(),
      };

      mockedAxios.create = jest.fn().mockReturnValue(mockClient) as any;
      mediumService.initialize(mockConfig);

      const result = await mediumService.publishPost(markdownPost);

      expect(result).toHaveProperty('id', 'post123');
      expect(mockClient.post).toHaveBeenCalledWith(
        '/users/user123/posts',
        expect.objectContaining({
          content: '# Heading\n\nThis is **markdown** content',
          contentFormat: 'markdown',
          publishStatus: 'draft',
        })
      );
    });

    it('should handle publish status options correctly', async () => {
      const draftPost: IMediumPost = {
        title: 'Draft Post',
        content: 'Content',
        contentFormat: 'markdown',
        publishStatus: 'draft',
      };

      const mockUserResponse = {
        data: { data: { id: 'user123' } },
      };
      const mockPostResponse = {
        data: {
          data: {
            id: 'post123',
            url: 'https://medium.com/@testuser/draft-post',
            title: 'Draft Post',
            authorId: 'user123',
            publishStatus: 'draft',
          },
        },
      };

      const mockClient = {
        get: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue(mockUserResponse),
        post: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue(mockPostResponse),
        put: jest.fn<(...args: any[]) => Promise<any>>(),
        delete: jest.fn<(...args: any[]) => Promise<any>>(),
      };

      mockedAxios.create = jest.fn().mockReturnValue(mockClient) as any;
      mediumService.initialize(mockConfig);

      await mediumService.publishPost(draftPost);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/users/user123/posts',
        expect.objectContaining({ publishStatus: 'draft' })
      );
    });

    it('should handle canonical URL', async () => {
      const postWithCanonical: IMediumPost = {
        title: 'Canonical Post',
        content: 'Content',
        contentFormat: 'markdown',
        publishStatus: 'public',
        canonicalUrl: 'https://example.com/original-post',
      };

      const mockUserResponse = {
        data: { data: { id: 'user123' } },
      };
      const mockPostResponse = {
        data: {
          data: {
            id: 'post123',
            url: 'https://medium.com/@testuser/canonical',
            title: 'Canonical Post',
            authorId: 'user123',
            publishStatus: 'public',
            canonicalUrl: 'https://example.com/original-post',
          },
        },
      };

      const mockClient = {
        get: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue(mockUserResponse),
        post: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue(mockPostResponse),
        put: jest.fn<(...args: any[]) => Promise<any>>(),
        delete: jest.fn<(...args: any[]) => Promise<any>>(),
      };

      mockedAxios.create = jest.fn().mockReturnValue(mockClient) as any;
      mediumService.initialize(mockConfig);

      await mediumService.publishPost(postWithCanonical);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/users/user123/posts',
        expect.objectContaining({
          canonicalUrl: 'https://example.com/original-post',
        })
      );
    });
  });

  describe('getUser', () => {
    it('should successfully get user information', async () => {
      const mockUserResponse = {
        data: {
          data: {
            id: 'user123',
            username: 'testuser',
            name: 'Test User',
            url: 'https://medium.com/@testuser',
            imageUrl: 'https://example.com/avatar.jpg',
          },
        },
      };

      const mockClient = {
        get: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue(mockUserResponse),
        post: jest.fn<(...args: any[]) => Promise<any>>(),
        put: jest.fn<(...args: any[]) => Promise<any>>(),
        delete: jest.fn<(...args: any[]) => Promise<any>>(),
      };

      mockedAxios.create = jest.fn().mockReturnValue(mockClient) as any;
      mediumService.initialize(mockConfig);

      const result = await mediumService.getUser();

      expect(result).toEqual({
        id: 'user123',
        username: 'testuser',
        name: 'Test User',
        url: 'https://medium.com/@testuser',
        imageUrl: 'https://example.com/avatar.jpg',
      });
      expect(mockClient.get).toHaveBeenCalledWith('/me');
    });
  });
});
