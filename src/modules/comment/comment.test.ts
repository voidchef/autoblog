import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import request from 'supertest';
import httpStatus from 'http-status';
import bcrypt from 'bcryptjs';
import moment from 'moment';
import app from '../../app';
import setupTestDB from '../jest/setupTestDB';
import User from '../user/user.model';
import Blog from '../blog/blog.model';
import Comment from './comment.model';
import config from '../../config/config';
import * as tokenService from '../token/token.service';
import tokenTypes from '../token/token.types';
import { NewComment } from './comment.interfaces';
import { NewCreatedBlog } from '../blog/blog.interfaces';

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

const userTwo = {
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
const userTwoAccessToken = tokenService.generateToken(userTwo._id, accessTokenExpires, tokenTypes.ACCESS);
const adminAccessToken = tokenService.generateToken(admin._id, accessTokenExpires, tokenTypes.ACCESS);

const blogOne: NewCreatedBlog = {
  topic: 'Test Topic',
  title: 'Test Blog Post',
  slug: 'test-blog-post',
  seoTitle: 'Test Blog Post - SEO Title',
  seoDescription: 'This is a test blog post',
  author: admin._id as mongoose.Types.ObjectId,
  content: 'This is the content of the test blog post. '.repeat(50),
  category: 'Technology',
  tags: ['test', 'blog'],
  language: 'en',
  llmModel: 'gpt-4o-mini',
};

const insertUsers = async (users: Record<string, any>[]) => {
  await User.insertMany(users.map((user) => ({ ...user, password: hashedPassword })));
};

const insertBlogs = async (blogs: NewCreatedBlog[]) => {
  await Blog.insertMany(blogs);
};

const insertComments = async (comments: any[]) => {
  await Comment.insertMany(comments);
};

describe('Comment routes', () => {
  describe('POST /v1/comments', () => {
    let newComment: Omit<NewComment, 'author'>;
    let blog: any;

    beforeEach(async () => {
      await insertUsers([userOne, admin]);
      await insertBlogs([blogOne]);
      blog = await Blog.findOne({ slug: blogOne.slug });

      newComment = {
        content: 'This is a test comment',
        blog: blog._id as mongoose.Types.ObjectId,
      };
    });

    test('should return 201 and successfully create new comment if data is ok', async () => {
      const res = await request(app)
        .post('/v1/comments')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newComment)
        .expect(httpStatus.CREATED);

      expect(res.body).toMatchObject({
        content: newComment.content,
        author: userOne._id.toString(),
        blog: blog._id.toString(),
        isDeleted: false,
      });

      const dbComment = await Comment.findById(res.body.id);
      expect(dbComment).toBeDefined();
      expect(dbComment?.content).toBe(newComment.content);
    });

    test('should return 201 and create reply to a comment', async () => {
      await insertUsers([userTwo]);
      // Create parent comment with author for database insertion
      const parentComment = await Comment.create({ ...newComment, author: userOne._id });
      const parentId = String(parentComment._id);

      const replyComment = {
        content: 'This is a reply to the comment',
        blog: blog._id as mongoose.Types.ObjectId,
        parentComment: new mongoose.Types.ObjectId(parentId),
      };

      const res = await request(app)
        .post('/v1/comments')
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send(replyComment)
        .expect(httpStatus.CREATED);

      expect(res.body).toMatchObject({
        content: replyComment.content,
        parentComment: parentId,
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/comments').send(newComment).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if content is missing', async () => {
      delete (newComment as any).content;

      await request(app)
        .post('/v1/comments')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newComment)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if blog is missing', async () => {
      delete (newComment as any).blog;

      await request(app)
        .post('/v1/comments')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newComment)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/comments', () => {
    let blog: any;

    beforeEach(async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertBlogs([blogOne]);
      blog = await Blog.findOne({ slug: blogOne.slug });
    });

    test('should return 200 and apply the default query options', async () => {
      const commentOne = {
        content: 'First comment',
        author: userOne._id,
        blog: blog._id,
      };
      const commentTwo = {
        content: 'Second comment',
        author: userTwo._id,
        blog: blog._id,
      };
      await insertComments([commentOne, commentTwo]);

      const res = await request(app).get('/v1/comments').send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
    });

    test('should correctly apply filter on blog field', async () => {
      const commentOne = {
        content: 'First comment',
        author: userOne._id,
        blog: blog._id,
      };
      await insertComments([commentOne]);

      const res = await request(app).get('/v1/comments').query({ blog: blog._id.toString() }).send().expect(httpStatus.OK);

      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].blog).toBe(blog._id.toString());
    });

    test('should not return deleted comments', async () => {
      const commentOne = {
        content: 'First comment',
        author: userOne._id,
        blog: blog._id,
        isDeleted: true,
      };
      const commentTwo = {
        content: 'Second comment',
        author: userTwo._id,
        blog: blog._id,
      };
      await insertComments([commentOne, commentTwo]);

      const res = await request(app).get('/v1/comments').send().expect(httpStatus.OK);

      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].content).toBe('Second comment');
    });

    test('should limit returned array if limit param is specified', async () => {
      const commentOne = {
        content: 'First comment',
        author: userOne._id,
        blog: blog._id,
      };
      const commentTwo = {
        content: 'Second comment',
        author: userTwo._id,
        blog: blog._id,
      };
      await insertComments([commentOne, commentTwo]);

      const res = await request(app).get('/v1/comments').query({ limit: 1 }).send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 1,
        totalPages: 2,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(1);
    });
  });

  describe('GET /v1/comments/blog/:blogId', () => {
    let blog: any;

    beforeEach(async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertBlogs([blogOne]);
      blog = await Blog.findOne({ slug: blogOne.slug });
    });

    test('should return 200 and all comments for a specific blog', async () => {
      const commentOne = {
        content: 'First comment',
        author: userOne._id,
        blog: blog._id,
      };
      const commentTwo = {
        content: 'Second comment',
        author: userTwo._id,
        blog: blog._id,
      };
      await insertComments([commentOne, commentTwo]);

      const res = await request(app).get(`/v1/comments/blog/${blog._id}`).send().expect(httpStatus.OK);

      expect(res.body.results).toHaveLength(2);
    });
  });

  describe('GET /v1/comments/:commentId', () => {
    let blog: any;

    beforeEach(async () => {
      await insertUsers([userOne, admin]);
      await insertBlogs([blogOne]);
      blog = await Blog.findOne({ slug: blogOne.slug });
    });

    test('should return 200 and the comment object if data is ok', async () => {
      const comment = {
        content: 'Test comment',
        author: userOne._id,
        blog: blog._id,
      };
      await insertComments([comment]);

      const dbComment = await Comment.findOne({ content: comment.content });

      const res = await request(app).get(`/v1/comments/${dbComment?._id}`).send().expect(httpStatus.OK);

      expect(res.body).toMatchObject({
        content: comment.content,
      });
    });

    test('should return 404 if comment is not found', async () => {
      await request(app).get(`/v1/comments/${new mongoose.Types.ObjectId()}`).send().expect(httpStatus.NOT_FOUND);
    });

    test('should return 404 if comment is deleted', async () => {
      const comment = {
        content: 'Test comment',
        author: userOne._id,
        blog: blog._id,
        isDeleted: true,
      };
      await insertComments([comment]);

      const dbComment = await Comment.findOne({ content: comment.content });

      await request(app).get(`/v1/comments/${dbComment?._id}`).send().expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/comments/:commentId', () => {
    let blog: any;

    beforeEach(async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertBlogs([blogOne]);
      blog = await Blog.findOne({ slug: blogOne.slug });
    });

    test('should return 200 and successfully update comment if data is ok', async () => {
      const comment = {
        content: 'Original comment',
        author: userOne._id,
        blog: blog._id,
      };
      await insertComments([comment]);

      const dbComment = await Comment.findOne({ content: comment.content });
      const updateBody = {
        content: 'Updated comment',
      };

      const res = await request(app)
        .patch(`/v1/comments/${dbComment?._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body.content).toBe(updateBody.content);

      const dbUpdatedComment = await Comment.findById(dbComment?._id);
      expect(dbUpdatedComment?.content).toBe(updateBody.content);
    });

    test('should return 401 error if access token is missing', async () => {
      const comment = {
        content: 'Original comment',
        author: userOne._id,
        blog: blog._id,
      };
      await insertComments([comment]);

      const dbComment = await Comment.findOne({ content: comment.content });
      const updateBody = { content: 'Updated comment' };

      await request(app).patch(`/v1/comments/${dbComment?._id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 404 if comment is not found', async () => {
      const updateBody = { content: 'Updated comment' };

      await request(app)
        .patch(`/v1/comments/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/comments/:commentId', () => {
    let blog: any;

    beforeEach(async () => {
      await insertUsers([userOne, admin]);
      await insertBlogs([blogOne]);
      blog = await Blog.findOne({ slug: blogOne.slug });
    });

    test('should return 204 and soft delete comment successfully', async () => {
      const comment = {
        content: 'Test comment',
        author: userOne._id,
        blog: blog._id,
      };
      await insertComments([comment]);

      const dbComment = await Comment.findOne({ content: comment.content });

      await request(app)
        .delete(`/v1/comments/${dbComment?._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbDeletedComment = await Comment.findById(dbComment?._id);
      expect(dbDeletedComment).toBeDefined();
      expect(dbDeletedComment?.isDeleted).toBe(true);
    });

    test('should return 401 error if access token is missing', async () => {
      const comment = {
        content: 'Test comment',
        author: userOne._id,
        blog: blog._id,
      };
      await insertComments([comment]);

      const dbComment = await Comment.findOne({ content: comment.content });

      await request(app).delete(`/v1/comments/${dbComment?._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 404 error if comment is not found', async () => {
      await request(app)
        .delete(`/v1/comments/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('GET /v1/comments/:commentId/replies', () => {
    let blog: any;

    beforeEach(async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertBlogs([blogOne]);
      blog = await Blog.findOne({ slug: blogOne.slug });
    });

    test('should return 200 and all replies to a comment', async () => {
      const parentComment = {
        content: 'Parent comment',
        author: userOne._id,
        blog: blog._id,
      };
      await insertComments([parentComment]);

      const dbParentComment = await Comment.findOne({ content: parentComment.content });
      const parentId = String(dbParentComment?._id);

      const reply1 = {
        content: 'First reply',
        author: userTwo._id,
        blog: blog._id,
        parentComment: new mongoose.Types.ObjectId(parentId),
      };
      const reply2 = {
        content: 'Second reply',
        author: userOne._id,
        blog: blog._id,
        parentComment: new mongoose.Types.ObjectId(parentId),
      };
      await insertComments([reply1, reply2]);

      const res = await request(app).get(`/v1/comments/${dbParentComment?._id}/replies`).send().expect(httpStatus.OK);

      expect(res.body.results).toHaveLength(2);
    });
  });

  describe('POST /v1/comments/:commentId/like', () => {
    let blog: any;

    beforeEach(async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertBlogs([blogOne]);
      blog = await Blog.findOne({ slug: blogOne.slug });
    });

    test('should return 200 and successfully like comment', async () => {
      const comment = {
        content: 'Test comment',
        author: userOne._id,
        blog: blog._id,
      };
      await insertComments([comment]);

      const dbComment = await Comment.findOne({ content: comment.content });

      const res = await request(app)
        .post(`/v1/comments/${dbComment?._id}/like`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body.likes).toHaveLength(1);
      expect(res.body.likes[0]).toBe(userTwo._id.toString());
    });

    test('should return 401 error if access token is missing', async () => {
      const comment = {
        content: 'Test comment',
        author: userOne._id,
        blog: blog._id,
      };
      await insertComments([comment]);

      const dbComment = await Comment.findOne({ content: comment.content });

      await request(app).post(`/v1/comments/${dbComment?._id}/like`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should toggle like if user already liked', async () => {
      const comment = {
        content: 'Test comment',
        author: userOne._id,
        blog: blog._id,
      };
      await insertComments([comment]);

      const dbComment = await Comment.findOne({ content: comment.content });

      // First like
      await request(app)
        .post(`/v1/comments/${dbComment?._id}/like`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      // Second like (unlike)
      const res = await request(app)
        .post(`/v1/comments/${dbComment?._id}/like`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body.likes).toHaveLength(0);
    });

    test('should remove dislike when liking', async () => {
      const comment = {
        content: 'Test comment',
        author: userOne._id,
        blog: blog._id,
      };
      await insertComments([comment]);

      const dbComment = await Comment.findOne({ content: comment.content });

      // First dislike
      await request(app)
        .post(`/v1/comments/${dbComment?._id}/dislike`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      // Then like
      const res = await request(app)
        .post(`/v1/comments/${dbComment?._id}/like`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body.likes).toHaveLength(1);
      expect(res.body.dislikes).toHaveLength(0);
    });
  });

  describe('POST /v1/comments/:commentId/dislike', () => {
    let blog: any;

    beforeEach(async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertBlogs([blogOne]);
      blog = await Blog.findOne({ slug: blogOne.slug });
    });

    test('should return 200 and successfully dislike comment', async () => {
      const comment = {
        content: 'Test comment',
        author: userOne._id,
        blog: blog._id,
      };
      await insertComments([comment]);

      const dbComment = await Comment.findOne({ content: comment.content });

      const res = await request(app)
        .post(`/v1/comments/${dbComment?._id}/dislike`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body.dislikes).toHaveLength(1);
      expect(res.body.dislikes[0]).toBe(userTwo._id.toString());
    });

    test('should toggle dislike if user already disliked', async () => {
      const comment = {
        content: 'Test comment',
        author: userOne._id,
        blog: blog._id,
      };
      await insertComments([comment]);

      const dbComment = await Comment.findOne({ content: comment.content });

      // First dislike
      await request(app)
        .post(`/v1/comments/${dbComment?._id}/dislike`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      // Second dislike (undislike)
      const res = await request(app)
        .post(`/v1/comments/${dbComment?._id}/dislike`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body.dislikes).toHaveLength(0);
    });
  });

  describe('Comment model methods', () => {
    let blog: any;

    beforeEach(async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertBlogs([blogOne]);
      blog = await Blog.findOne({ slug: blogOne.slug });
    });

    test('toggleLike should add user to likes array', async () => {
      const comment = {
        content: 'Test comment',
        author: userOne._id,
        blog: blog._id,
      };
      await insertComments([comment]);

      const dbComment = await Comment.findOne({ content: comment.content });
      await dbComment?.toggleLike(userTwo._id);

      const updatedComment = await Comment.findById(dbComment?._id);
      expect(updatedComment?.likes).toHaveLength(1);
      expect(updatedComment?.likes[0]?.toString()).toBe(userTwo._id.toString());
    });

    test('toggleLike should remove user from likes array if already liked', async () => {
      const comment = {
        content: 'Test comment',
        author: userOne._id,
        blog: blog._id,
        likes: [userTwo._id],
      };
      await insertComments([comment]);

      const dbComment = await Comment.findOne({ content: comment.content });
      await dbComment?.toggleLike(userTwo._id);

      const updatedComment = await Comment.findById(dbComment?._id);
      expect(updatedComment?.likes).toHaveLength(0);
    });

    test('toggleDislike should add user to dislikes array', async () => {
      const comment = {
        content: 'Test comment',
        author: userOne._id,
        blog: blog._id,
      };
      await insertComments([comment]);

      const dbComment = await Comment.findOne({ content: comment.content });
      await dbComment?.toggleDislike(userTwo._id);

      const updatedComment = await Comment.findById(dbComment?._id);
      expect(updatedComment?.dislikes).toHaveLength(1);
      expect(updatedComment?.dislikes[0]?.toString()).toBe(userTwo._id.toString());
    });

    test('toggleDislike should remove user from dislikes array if already disliked', async () => {
      const comment = {
        content: 'Test comment',
        author: userOne._id,
        blog: blog._id,
        dislikes: [userTwo._id],
      };
      await insertComments([comment]);

      const dbComment = await Comment.findOne({ content: comment.content });
      await dbComment?.toggleDislike(userTwo._id);

      const updatedComment = await Comment.findById(dbComment?._id);
      expect(updatedComment?.dislikes).toHaveLength(0);
    });
  });
});
