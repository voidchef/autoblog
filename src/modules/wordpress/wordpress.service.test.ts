import axios from 'axios';
import wordpressService from './wordpress.service';
import { IWordPressConfig, IWordPressPost } from './wordpress.interfaces';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WordPress Service', () => {
  const mockConfig: IWordPressConfig = {
    siteUrl: 'https://example.com',
    username: 'testuser',
    applicationPassword: 'test-app-password',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize with valid configuration', () => {
      expect(() => wordpressService.initialize(mockConfig)).not.toThrow();
    });
  });

  describe('publishPost', () => {
    beforeEach(() => {
      wordpressService.initialize(mockConfig);
    });

    it('should successfully publish a post', async () => {
      const mockPost: IWordPressPost = {
        title: 'Test Blog Post',
        content: '<p>This is test content</p>',
        status: 'publish',
      };

      const mockCategoriesResponse = { data: [] };
      const mockTagsResponse = { data: [] };
      const mockPostResponse = {
        data: {
          id: 123,
          link: 'https://example.com/test-blog-post',
          title: { rendered: 'Test Blog Post' },
          status: 'publish',
        },
      };

      const mockClient = {
        get: jest.fn()
          .mockResolvedValueOnce(mockCategoriesResponse)
          .mockResolvedValueOnce(mockTagsResponse),
        post: jest.fn().mockResolvedValue(mockPostResponse),
        put: jest.fn(),
      };

      mockedAxios.create = jest.fn().mockReturnValue(mockClient) as any;

      wordpressService.initialize(mockConfig);
      const result = await wordpressService.publishPost(mockPost);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('link');
    });

    it('should handle categories correctly', async () => {
      const mockPost: IWordPressPost = {
        title: 'Test Blog Post',
        content: '<p>This is test content</p>',
        status: 'publish',
        categories: [1, 2],
      };

      const mockPostResponse = {
        data: {
          id: 123,
          link: 'https://example.com/test-blog-post',
          title: { rendered: 'Test Blog Post' },
          status: 'publish',
        },
      };

      const mockClient = {
        get: jest.fn().mockResolvedValue({ data: [] }),
        post: jest.fn().mockResolvedValue(mockPostResponse),
        put: jest.fn(),
      };

      mockedAxios.create = jest.fn().mockReturnValue(mockClient) as any;
      wordpressService.initialize(mockConfig);

      const result = await wordpressService.publishPost(mockPost);

      expect(result).toHaveProperty('id', 123);
      expect(mockClient.post).toHaveBeenCalled();
    });
  });

  describe('uploadMedia', () => {
    beforeEach(() => {
      wordpressService.initialize(mockConfig);
    });

    it('should successfully upload media', async () => {
      const mockImageUrl = 'https://example.com/image.jpg';
      const mockImageResponse = {
        data: Buffer.from('fake-image-data'),
        headers: { 'content-type': 'image/jpeg' },
      };
      const mockMediaResponse = {
        data: {
          id: 456,
          source_url: 'https://example.com/wp-content/uploads/image.jpg',
          title: { rendered: 'test-image' },
        },
      };

      mockedAxios.get = jest.fn().mockResolvedValue(mockImageResponse);
      const mockClient = {
        post: jest.fn().mockResolvedValue(mockMediaResponse),
        get: jest.fn(),
        put: jest.fn(),
      };
      mockedAxios.create = jest.fn().mockReturnValue(mockClient) as any;

      wordpressService.initialize(mockConfig);
      const result = await wordpressService.uploadMedia(mockImageUrl, 'test-image');

      expect(result).toHaveProperty('id', 456);
      expect(result).toHaveProperty('source_url');
    });
  });

  describe('getOrCreateCategory', () => {
    beforeEach(() => {
      wordpressService.initialize(mockConfig);
    });

    it('should return existing category', async () => {
      const mockCategoryResponse = { data: [{ id: 1, name: 'Technology' }] };
      const mockClient = {
        get: jest.fn().mockResolvedValue(mockCategoryResponse),
        post: jest.fn(),
        put: jest.fn(),
      };

      mockedAxios.create = jest.fn().mockReturnValue(mockClient) as any;
      wordpressService.initialize(mockConfig);

      const result = await wordpressService.getOrCreateCategory('Technology');

      expect(result).toBe(1);
      expect(mockClient.get).toHaveBeenCalled();
    });

    it('should create new category if not found', async () => {
      const mockEmptyResponse = { data: [] };
      const mockCreateResponse = { data: { id: 99, name: 'NewCategory' } };

      const mockClient = {
        get: jest.fn().mockResolvedValue(mockEmptyResponse),
        post: jest.fn().mockResolvedValue(mockCreateResponse),
        put: jest.fn(),
      };

      mockedAxios.create = jest.fn().mockReturnValue(mockClient) as any;
      wordpressService.initialize(mockConfig);

      const result = await wordpressService.getOrCreateCategory('NewCategory');

      expect(result).toBe(99);
      expect(mockClient.post).toHaveBeenCalled();
    });
  });

  describe('getOrCreateTag', () => {
    beforeEach(() => {
      wordpressService.initialize(mockConfig);
    });

    it('should return existing tag', async () => {
      const mockTagResponse = { data: [{ id: 10, name: 'test' }] };
      const mockClient = {
        get: jest.fn().mockResolvedValue(mockTagResponse),
        post: jest.fn(),
        put: jest.fn(),
      };

      mockedAxios.create = jest.fn().mockReturnValue(mockClient) as any;
      wordpressService.initialize(mockConfig);

      const result = await wordpressService.getOrCreateTag('test');

      expect(result).toBe(10);
    });

    it('should create new tag if not found', async () => {
      const mockEmptyResponse = { data: [] };
      const mockCreateResponse = { data: { id: 99, name: 'newtag' } };

      const mockClient = {
        get: jest.fn().mockResolvedValue(mockEmptyResponse),
        post: jest.fn().mockResolvedValue(mockCreateResponse),
        put: jest.fn(),
      };

      mockedAxios.create = jest.fn().mockReturnValue(mockClient) as any;
      wordpressService.initialize(mockConfig);

      const result = await wordpressService.getOrCreateTag('newtag');

      expect(result).toBe(99);
    });
  });
});
