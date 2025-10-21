import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import request from 'supertest';
import httpStatus from 'http-status';
import bcrypt from 'bcryptjs';
import moment from 'moment';
import app from '../../app';
import setupTestDB from '../jest/setupTestDB';
import User from '../user/user.model';
import Blog from './blog.model';
import config from '../../config/config';
import * as tokenService from '../token/token.service';
import tokenTypes from '../token/token.types';
import { NewCreatedBlog } from './blog.interfaces';

setupTestDB();

const password = 'password1';
const salt = bcrypt.genSaltSync(8);
const hashedPassword = bcrypt.hashSync(password, salt);
const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');

const userOne = {
  _id: new mongoose.Types.ObjectId(),
  name: faker.person.fullName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: 'user',
  isEmailVerified: false,
};

const admin = {
  _id: new mongoose.Types.ObjectId(),
  name: faker.person.fullName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: 'admin',
  isEmailVerified: false,
};

const userOneAccessToken = tokenService.generateToken(userOne._id, accessTokenExpires, tokenTypes.ACCESS);
const adminAccessToken = tokenService.generateToken(admin._id, accessTokenExpires, tokenTypes.ACCESS);

const blogOne: NewCreatedBlog = {
  topic: 'Test Topic',
  title: 'Test Blog Post',
  slug: 'test-blog-post',
  seoTitle: 'Test Blog Post - SEO Title',
  seoDescription: 'This is a test blog post for SEO',
  author: admin._id as mongoose.Types.ObjectId,
  content: 'This is the content of the test blog post. '.repeat(50),
  category: 'Technology',
  tags: ['test', 'blog', 'technology'],
  language: 'en',
  llmModel: 'gpt-4o-mini',
};

const blogTwo: NewCreatedBlog = {
  topic: 'Another Topic',
  title: 'Another Blog Post',
  slug: 'another-blog-post',
  seoTitle: 'Another Blog Post - SEO Title',
  seoDescription: 'This is another test blog post',
  author: admin._id as mongoose.Types.ObjectId,
  content: 'This is the content of another blog post. '.repeat(50),
  category: 'Health',
  tags: ['test', 'health'],
  language: 'en',
  llmModel: 'gpt-4o',
};

const insertUsers = async (users: Record<string, any>[]) => {
  await User.insertMany(users.map((user) => ({ ...user, password: hashedPassword })));
};

const insertBlogs = async (blogs: NewCreatedBlog[]) => {
  await Blog.create(blogs);
};

describe('Blog routes', () => {
  describe('POST /v1/blogs/create', () => {
    let newBlog: NewCreatedBlog;
    beforeEach(() => {
      newBlog = {
        topic: 'New Topic',
        title: 'New Blog Post',
        slug: 'new-blog-post',
        seoTitle: 'New Blog Post - SEO',
        seoDescription: 'New blog post description',
        author: admin._id as mongoose.Types.ObjectId,
        content: 'This is a new blog post content. '.repeat(50),
        category: 'Technology',
        tags: ['new', 'test'],
        language: 'en',
        llmModel: 'gpt-4o-mini',
      };
    });

    test('should return 201 and successfully create new blog if data is ok', async () => {
      await insertUsers([admin]);

      const res = await request(app)
        .post('/v1/blogs/create')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newBlog)
        .expect(httpStatus.CREATED);

      expect(res.body).toMatchObject({
        title: newBlog.title,
        slug: newBlog.slug,
        seoTitle: newBlog.seoTitle,
        seoDescription: newBlog.seoDescription,
        content: newBlog.content,
        category: newBlog.category,
        tags: newBlog.tags,
        isFeatured: false,
        isPublished: false,
        isDraft: true,
      });

      const dbBlog = await Blog.findById(res.body.id);
      expect(dbBlog).toBeDefined();
      expect(dbBlog).toMatchObject({
        title: newBlog.title,
        slug: newBlog.slug,
        category: newBlog.category,
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/blogs/create').send(newBlog).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user does not have manageBlogs permission', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post('/v1/blogs/create')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newBlog)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 error if title is missing', async () => {
      await insertUsers([admin]);
      delete (newBlog as any).title;

      await request(app)
        .post('/v1/blogs/create')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newBlog)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/blogs', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertUsers([admin]);
      await insertBlogs([blogOne, blogTwo]);

      const res = await request(app).get('/v1/blogs').send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0]).toHaveProperty('excerpt');
    });

    test('should correctly apply filter on category field', async () => {
      await insertUsers([admin]);
      await insertBlogs([blogOne, blogTwo]);

      const res = await request(app).get('/v1/blogs').query({ category: 'Technology' }).send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 1,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].category).toBe('Technology');
    });

    test('should correctly apply filter on isPublished field', async () => {
      await insertUsers([admin]);
      const publishedBlog = { ...blogOne, isPublished: true, isDraft: false };
      await insertBlogs([publishedBlog, blogTwo]);

      const res = await request(app).get('/v1/blogs').query({ isPublished: true }).send().expect(httpStatus.OK);

      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].isPublished).toBe(true);
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertUsers([admin]);
      await insertBlogs([blogOne, blogTwo]);

      const res = await request(app).get('/v1/blogs').query({ limit: 1 }).send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 1,
        totalPages: 2,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(1);
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertUsers([admin]);
      await insertBlogs([blogOne, blogTwo]);

      const res = await request(app).get('/v1/blogs').query({ page: 2, limit: 1 }).send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 2,
        limit: 1,
        totalPages: 2,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(1);
    });
  });

  describe('GET /v1/blogs/:blogId', () => {
    test('should return 200 and the blog object if data is ok', async () => {
      await insertUsers([admin]);
      await insertBlogs([blogOne]);

      const dbBlog = await Blog.findOne({ slug: blogOne.slug });

      const res = await request(app).get(`/v1/blogs/${dbBlog?._id}`).send().expect(httpStatus.OK);

      expect(res.body).toMatchObject({
        title: blogOne.title,
        slug: blogOne.slug,
        content: blogOne.content,
        category: blogOne.category,
      });
    });

    test('should return 200 and the blog object when accessing by slug', async () => {
      await insertUsers([admin]);
      await insertBlogs([blogOne]);

      const res = await request(app).get(`/v1/blogs/${blogOne.slug}`).send().expect(httpStatus.OK);

      expect(res.body).toMatchObject({
        title: blogOne.title,
        slug: blogOne.slug,
        content: blogOne.content,
      });
    });

    test('should return 404 if blog is not found', async () => {
      await insertUsers([admin]);

      await request(app).get(`/v1/blogs/${new mongoose.Types.ObjectId()}`).send().expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/blogs/:blogId', () => {
    test('should return 200 and successfully update blog if data is ok', async () => {
      await insertUsers([admin]);
      await insertBlogs([blogOne]);

      const dbBlog = await Blog.findOne({ slug: blogOne.slug });
      const updateBody = {
        title: 'Updated Title',
        content: 'Updated content',
      };

      const res = await request(app)
        .patch(`/v1/blogs/${dbBlog?._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toMatchObject({
        title: updateBody.title,
        content: updateBody.content,
      });

      const dbUpdatedBlog = await Blog.findById(dbBlog?._id);
      expect(dbUpdatedBlog).toMatchObject({
        title: updateBody.title,
        content: updateBody.content,
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([admin]);
      await insertBlogs([blogOne]);

      const dbBlog = await Blog.findOne({ slug: blogOne.slug });
      const updateBody = { title: 'Updated Title' };

      await request(app).patch(`/v1/blogs/${dbBlog?._id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if user does not have manageBlogs permission', async () => {
      await insertUsers([userOne, admin]);
      await insertBlogs([blogOne]);

      const dbBlog = await Blog.findOne({ slug: blogOne.slug });
      const updateBody = { title: 'Updated Title' };

      await request(app)
        .patch(`/v1/blogs/${dbBlog?._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 404 if blog is not found', async () => {
      await insertUsers([admin]);

      const updateBody = { title: 'Updated Title' };

      await request(app)
        .patch(`/v1/blogs/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/blogs/:blogId', () => {
    test('should return 204 if blog is deleted successfully', async () => {
      await insertUsers([admin]);
      await insertBlogs([blogOne]);

      const dbBlog = await Blog.findOne({ slug: blogOne.slug });

      await request(app)
        .delete(`/v1/blogs/${dbBlog?._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbDeletedBlog = await Blog.findById(dbBlog?._id);
      expect(dbDeletedBlog).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([admin]);
      await insertBlogs([blogOne]);

      const dbBlog = await Blog.findOne({ slug: blogOne.slug });

      await request(app).delete(`/v1/blogs/${dbBlog?._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user does not have manageBlogs permission', async () => {
      await insertUsers([userOne, admin]);
      await insertBlogs([blogOne]);

      const dbBlog = await Blog.findOne({ slug: blogOne.slug });

      await request(app)
        .delete(`/v1/blogs/${dbBlog?._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 404 error if blog is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete(`/v1/blogs/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/blogs/:blogId/publish', () => {
    test('should return 200 and successfully publish blog', async () => {
      await insertUsers([admin]);
      await insertBlogs([blogOne]);

      const dbBlog = await Blog.findOne({ slug: blogOne.slug });

      const res = await request(app)
        .patch(`/v1/blogs/${dbBlog?._id}/publish`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body.isPublished).toBe(true);
      expect(res.body.isDraft).toBe(false);

      const dbPublishedBlog = await Blog.findById(dbBlog?._id);
      expect(dbPublishedBlog?.isPublished).toBe(true);
      expect(dbPublishedBlog?.isDraft).toBe(false);
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([admin]);
      await insertBlogs([blogOne]);

      const dbBlog = await Blog.findOne({ slug: blogOne.slug });

      await request(app).patch(`/v1/blogs/${dbBlog?._id}/publish`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if user does not have manageBlogs permission', async () => {
      await insertUsers([userOne, admin]);
      await insertBlogs([blogOne]);

      const dbBlog = await Blog.findOne({ slug: blogOne.slug });

      await request(app)
        .patch(`/v1/blogs/${dbBlog?._id}/publish`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });
  });

  describe('PATCH /v1/blogs/:blogId/unpublish', () => {
    test('should return 200 and successfully unpublish blog', async () => {
      await insertUsers([admin]);
      const publishedBlog = { ...blogOne, isPublished: true, isDraft: false };
      await insertBlogs([publishedBlog]);

      const dbBlog = await Blog.findOne({ slug: blogOne.slug });

      const res = await request(app)
        .patch(`/v1/blogs/${dbBlog?._id}/unpublish`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body.isPublished).toBe(false);
      expect(res.body.isDraft).toBe(true);
    });
  });

  describe('PATCH /v1/blogs/:blogId/toggle-featured', () => {
    test('should return 200 and successfully toggle featured status', async () => {
      await insertUsers([admin]);
      await insertBlogs([blogOne]);

      const dbBlog = await Blog.findOne({ slug: blogOne.slug });

      const res = await request(app)
        .patch(`/v1/blogs/${dbBlog?._id}/toggle-featured`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body.isFeatured).toBe(true);

      const res2 = await request(app)
        .patch(`/v1/blogs/${dbBlog?._id}/toggle-featured`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res2.body.isFeatured).toBe(false);
    });

    test('should return 404 if blog is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .patch(`/v1/blogs/${new mongoose.Types.ObjectId()}/toggle-featured`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('POST /v1/blogs/:blogId/like', () => {
    test('should return 200 and successfully like blog', async () => {
      await insertUsers([admin, userOne]);
      await insertBlogs([blogOne]);

      const dbBlog = await Blog.findOne({ slug: blogOne.slug });

      const res = await request(app)
        .post(`/v1/blogs/${dbBlog?._id}/like`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body.likes).toHaveLength(1);
      expect(res.body.likes[0]).toBe(userOne._id.toString());
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([admin]);
      await insertBlogs([blogOne]);

      const dbBlog = await Blog.findOne({ slug: blogOne.slug });

      await request(app).post(`/v1/blogs/${dbBlog?._id}/like`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should toggle like if user already liked', async () => {
      await insertUsers([admin, userOne]);
      await insertBlogs([blogOne]);

      const dbBlog = await Blog.findOne({ slug: blogOne.slug });

      // First like
      await request(app)
        .post(`/v1/blogs/${dbBlog?._id}/like`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      // Second like (unlike)
      const res = await request(app)
        .post(`/v1/blogs/${dbBlog?._id}/like`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body.likes).toHaveLength(0);
    });
  });

  describe('POST /v1/blogs/:blogId/dislike', () => {
    test('should return 200 and successfully dislike blog', async () => {
      await insertUsers([admin, userOne]);
      await insertBlogs([blogOne]);

      const dbBlog = await Blog.findOne({ slug: blogOne.slug });

      const res = await request(app)
        .post(`/v1/blogs/${dbBlog?._id}/dislike`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body.dislikes).toHaveLength(1);
      expect(res.body.dislikes[0]).toBe(userOne._id.toString());
    });

    test('should remove like if user dislikes after liking', async () => {
      await insertUsers([admin, userOne]);
      await insertBlogs([blogOne]);

      const dbBlog = await Blog.findOne({ slug: blogOne.slug });

      // First like
      await request(app)
        .post(`/v1/blogs/${dbBlog?._id}/like`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      // Then dislike
      const res = await request(app)
        .post(`/v1/blogs/${dbBlog?._id}/dislike`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body.likes).toHaveLength(0);
      expect(res.body.dislikes).toHaveLength(1);
    });
  });

  describe('GET /v1/blogs/my-engagement-stats', () => {
    beforeEach(async () => {
      await insertUsers([admin, userOne]);
      // Make blogs published so they appear in engagement stats
      const publishedBlogOne = { ...blogOne, isPublished: true, isDraft: false };
      const publishedBlogTwo = { ...blogTwo, isPublished: true, isDraft: false };
      await insertBlogs([publishedBlogOne, publishedBlogTwo]);
    });

    test('should return 200 and aggregate engagement stats for all user blogs', async () => {
      const res = await request(app)
        .get('/v1/blogs/my-engagement-stats')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        totalBlogs: 2,
        totalLikes: 0,
        totalDislikes: 0,
        totalComments: 0,
        totalEngagement: 0,
        avgEngagementPerBlog: '0.00',
      });
    });

    test('should return correct aggregate stats with engagement data', async () => {
      const Comment = mongoose.model('Comment');
      const dbBlogOne = await Blog.findOne({ slug: blogOne.slug });
      const dbBlogTwo = await Blog.findOne({ slug: blogTwo.slug });

      // Add likes and dislikes to both blogs
      await dbBlogOne?.toggleLike(userOne._id);
      await dbBlogOne?.toggleLike(admin._id);
      await dbBlogTwo?.toggleLike(userOne._id);
      await dbBlogTwo?.toggleDislike(admin._id);

      // Add comments
      await Comment.create([
        { content: 'Comment 1', author: userOne._id, blog: dbBlogOne?._id },
        { content: 'Comment 2', author: admin._id, blog: dbBlogOne?._id },
        { content: 'Comment 3', author: userOne._id, blog: dbBlogTwo?._id },
      ]);

      const res = await request(app)
        .get('/v1/blogs/my-engagement-stats')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body.totalBlogs).toBe(2);
      expect(res.body.totalLikes).toBe(3); // 2 likes on blog1, 1 like on blog2
      expect(res.body.totalDislikes).toBe(1); // 1 dislike on blog2
      expect(res.body.totalComments).toBe(3); // 2 comments on blog1, 1 on blog2
      expect(res.body.totalEngagement).toBe(7); // 3+1+3
      expect(parseFloat(res.body.avgEngagementPerBlog)).toBeCloseTo(3.5); // 7/2
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).get('/v1/blogs/my-engagement-stats').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return zero stats if user has no published blogs', async () => {
      const res = await request(app)
        .get('/v1/blogs/my-engagement-stats')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        totalBlogs: 0,
        totalLikes: 0,
        totalDislikes: 0,
        totalComments: 0,
        totalEngagement: 0,
        avgEngagementPerBlog: '0.00',
      });
    });
  });

  describe('GET /v1/blogs/:slug/engagement-stats', () => {
    beforeEach(async () => {
      await insertUsers([admin, userOne]);
      await insertBlogs([blogOne]);
    });

    test('should return 200 and engagement stats for a blog', async () => {
      const res = await request(app).get(`/v1/blogs/${blogOne.slug}/engagement-stats`).send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        slug: blogOne.slug,
        title: blogOne.title,
        likesCount: 0,
        dislikesCount: 0,
        commentsCount: 0,
        totalEngagement: 0,
      });
    });

    test('should return correct engagement stats with likes and dislikes', async () => {
      const Comment = mongoose.model('Comment');
      const dbBlog = await Blog.findOne({ slug: blogOne.slug });

      // Add likes and dislikes
      await dbBlog?.toggleLike(userOne._id);
      await dbBlog?.toggleDislike(admin._id);

      // Add comments
      await Comment.create([
        {
          content: 'Test comment 1',
          author: userOne._id,
          blog: dbBlog?._id,
        },
        {
          content: 'Test comment 2',
          author: admin._id,
          blog: dbBlog?._id,
        },
      ]);

      const res = await request(app).get(`/v1/blogs/${blogOne.slug}/engagement-stats`).send().expect(httpStatus.OK);

      expect(res.body.slug).toBe(blogOne.slug);
      expect(res.body.title).toBe(blogOne.title);
      expect(res.body.likesCount).toBe(1);
      expect(res.body.dislikesCount).toBe(1);
      expect(res.body.commentsCount).toBe(2);
      expect(res.body.totalEngagement).toBe(4); // 1 like + 1 dislike + 2 comments
    });

    test('should return 404 if blog does not exist', async () => {
      await request(app).get('/v1/blogs/non-existent-slug/engagement-stats').send().expect(httpStatus.NOT_FOUND);
    });

    test('should work without authentication', async () => {
      // No authentication token provided
      const res = await request(app).get(`/v1/blogs/${blogOne.slug}/engagement-stats`).send().expect(httpStatus.OK);

      expect(res.body).toHaveProperty('slug');
      expect(res.body).toHaveProperty('likesCount');
      expect(res.body).toHaveProperty('commentsCount');
    });

    test('should return zero counts for blog with no engagement', async () => {
      await insertBlogs([blogTwo]);

      const res = await request(app).get(`/v1/blogs/${blogTwo.slug}/engagement-stats`).send().expect(httpStatus.OK);

      expect(res.body.likesCount).toBe(0);
      expect(res.body.dislikesCount).toBe(0);
      expect(res.body.commentsCount).toBe(0);
      expect(res.body.totalEngagement).toBe(0);
    });
  });

  describe('Blog model methods', () => {
    test('should generate reading time correctly', async () => {
      await insertUsers([admin]);
      await insertBlogs([blogOne]);

      const dbBlog = await Blog.findOne({ slug: blogOne.slug });

      expect(dbBlog?.readingTime).toBeDefined();
      expect(dbBlog?.readingTime).toBeGreaterThan(0);
    });

    test('should generate excerpt correctly', async () => {
      await insertUsers([admin]);
      await insertBlogs([blogOne]);

      const dbBlog = await Blog.findOne({ slug: blogOne.slug });

      const excerpt = dbBlog?.generateExcerpt(100);
      expect(excerpt).toBeDefined();
      expect(excerpt?.length).toBeLessThanOrEqual(103); // 100 + '...'
    });
  });
});
