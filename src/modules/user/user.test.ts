import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import httpStatus from 'http-status';
import moment from 'moment';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app';
import config from '../../config/config';
import setupTestDB from '../jest/setupTestDB';
import * as tokenService from '../token/token.service';
import tokenTypes from '../token/token.types';
import { NewCreatedUser } from './user.interfaces';
import User from './user.model';

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
const adminAccessToken = tokenService.generateToken(admin._id, accessTokenExpires, tokenTypes.ACCESS);

const insertUsers = async (users: Record<string, any>[]) => {
  await User.insertMany(users.map((user) => ({ ...user, password: hashedPassword })));
};

describe('User routes', () => {
  describe('POST /v1/users', () => {
    let newUser: NewCreatedUser;

    beforeEach(() => {
      newUser = {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: 'password1',
        role: 'user',
        openAiKey: faker.string.alphanumeric(32),
      };
    });

    test('should return 201 and successfully create new user if data is ok', async () => {
      await insertUsers([admin]);

      const res = await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.CREATED);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual(
        expect.objectContaining({
          id: expect.anything(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          isEmailVerified: false,
        })
      );

      const dbUser = await User.findById(res.body.id);
      expect(dbUser).toBeDefined();
      if (!dbUser) return;

      expect(dbUser.password).not.toBe(newUser.password);
      expect(dbUser).toMatchObject({
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isEmailVerified: false,
      });
    });

    test('should be able to create an admin as well', async () => {
      await insertUsers([admin]);
      newUser.role = 'admin';

      const res = await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.CREATED);

      expect(res.body.role).toBe('admin');

      const dbUser = await User.findById(res.body.id);
      expect(dbUser).toBeDefined();
      if (!dbUser) return;
      expect(dbUser.role).toBe('admin');
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/users').send(newUser).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if logged in user is not admin', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newUser)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 error if email is invalid', async () => {
      await insertUsers([admin]);
      newUser.email = 'invalidEmail';

      await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if email is already used', async () => {
      await insertUsers([admin, userOne]);
      newUser.email = userOne.email;

      await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if password length is less than 8 characters', async () => {
      await insertUsers([admin]);
      newUser.password = 'passwo1';

      await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if password does not contain both letters and numbers', async () => {
      await insertUsers([admin]);
      newUser.password = 'password';

      await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);

      newUser.password = '1111111';

      await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if role is neither user nor admin', async () => {
      await insertUsers([admin]);
      (newUser as any).role = 'invalid';

      await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/users', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(3);
      expect(res.body.results[0]).toEqual(
        expect.objectContaining({
          id: userOne._id.toHexString(),
          name: userOne.name,
          email: userOne.email,
          role: userOne.role,
          isEmailVerified: userOne.isEmailVerified,
        })
      );
    });

    test('should return 401 if access token is missing', async () => {
      await insertUsers([userOne, userTwo, admin]);

      await request(app).get('/v1/users').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if a non-admin is trying to access all users', async () => {
      await insertUsers([userOne, userTwo, admin]);

      await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should correctly apply filter on name field', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ name: userOne.name })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 1,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(userOne._id.toHexString());
    });

    test('should correctly apply filter on role field', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ role: 'user' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0].id).toBe(userOne._id.toHexString());
      expect(res.body.results[1].id).toBe(userTwo._id.toHexString());
    });

    test('should correctly sort the returned array if descending sort param is specified', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'role:desc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(3);
      expect(res.body.results[0].id).toBe(userOne._id.toHexString());
      expect(res.body.results[1].id).toBe(userTwo._id.toHexString());
      expect(res.body.results[2].id).toBe(admin._id.toHexString());
    });

    test('should correctly sort the returned array if ascending sort param is specified', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'role:asc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(3);
      expect(res.body.results[0].id).toBe(admin._id.toHexString());
      expect(res.body.results[1].id).toBe(userOne._id.toHexString());
      expect(res.body.results[2].id).toBe(userTwo._id.toHexString());
    });

    test('should correctly sort the returned array if multiple sorting criteria are specified', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'role:desc,name:asc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(3);

      const expectedOrder = [userOne, userTwo, admin].sort((a, b) => {
        if (a.role < b.role) {
          return 1;
        }
        if (a.role > b.role) {
          return -1;
        }
        return a.name < b.name ? -1 : 1;
      });

      expectedOrder.forEach((user, index) => {
        expect(res.body.results[index].id).toBe(user._id.toHexString());
      });
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ limit: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 2,
        totalPages: 2,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0].id).toBe(userOne._id.toHexString());
      expect(res.body.results[1].id).toBe(userTwo._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ page: 2, limit: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 2,
        limit: 2,
        totalPages: 2,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(admin._id.toHexString());
    });
  });

  describe('GET /v1/users/:userId', () => {
    test('should return 200 and the user object if data is ok', async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .get(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual(
        expect.objectContaining({
          id: userOne._id.toHexString(),
          email: userOne.email,
          name: userOne.name,
          role: userOne.role,
          isEmailVerified: userOne.isEmailVerified,
        })
      );
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);

      await request(app).get(`/v1/users/${userOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user is trying to get another user', async () => {
      await insertUsers([userOne, userTwo]);

      await request(app)
        .get(`/v1/users/${userTwo._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 200 and the user object if admin is trying to get another user', async () => {
      await insertUsers([userOne, admin]);

      await request(app)
        .get(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);
    });

    test('should return 400 error if userId is not a valid mongo id', async () => {
      await insertUsers([admin]);

      await request(app)
        .get('/v1/users/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if user is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .get(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/users/:userId', () => {
    test('should return 204 if data is ok', async () => {
      await insertUsers([userOne]);

      await request(app)
        .delete(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbUser = await User.findById(userOne._id);
      expect(dbUser).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);

      await request(app).delete(`/v1/users/${userOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user is trying to delete another user', async () => {
      await insertUsers([userOne, userTwo]);

      await request(app)
        .delete(`/v1/users/${userTwo._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 204 if admin is trying to delete another user', async () => {
      await insertUsers([userOne, admin]);

      await request(app)
        .delete(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);
    });

    test('should return 400 error if userId is not a valid mongo id', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete('/v1/users/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if user already is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/users/:userId', () => {
    test('should return 200 and successfully update user if data is ok', async () => {
      await insertUsers([userOne]);
      const updateBody = {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: 'newPassword1',
      };

      const res = await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual(
        expect.objectContaining({
          id: userOne._id.toHexString(),
          name: updateBody.name,
          email: updateBody.email,
          role: 'user',
          isEmailVerified: false,
        })
      );

      const dbUser = await User.findById(userOne._id);
      expect(dbUser).toBeDefined();
      if (!dbUser) return;
      expect(dbUser.password).not.toBe(updateBody.password);
      expect(dbUser).toMatchObject({ name: updateBody.name, email: updateBody.email, role: 'user' });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);
      const updateBody = { name: faker.person.fullName() };

      await request(app).patch(`/v1/users/${userOne._id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if user is updating another user', async () => {
      await insertUsers([userOne, userTwo]);
      const updateBody = { name: faker.person.fullName() };

      await request(app)
        .patch(`/v1/users/${userTwo._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 200 and successfully update user if admin is updating another user', async () => {
      await insertUsers([userOne, admin]);
      const updateBody = { name: faker.person.fullName() };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
    });

    test('should return 404 if admin is updating another user that is not found', async () => {
      await insertUsers([admin]);
      const updateBody = { name: faker.person.fullName() };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if userId is not a valid mongo id', async () => {
      await insertUsers([admin]);
      const updateBody = { name: faker.person.fullName() };

      await request(app)
        .patch(`/v1/users/invalidId`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if email is invalid', async () => {
      await insertUsers([userOne]);
      const updateBody = { email: 'invalidEmail' };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if email is already taken', async () => {
      await insertUsers([userOne, userTwo]);
      const updateBody = { email: userTwo.email };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should not return 400 if email is my email', async () => {
      await insertUsers([userOne]);
      const updateBody = { email: userOne.email };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
    });

    test('should return 400 if password length is less than 8 characters', async () => {
      await insertUsers([userOne]);
      const updateBody = { password: 'passwo1' };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if password does not contain both letters and numbers', async () => {
      await insertUsers([userOne]);
      const updateBody = { password: 'password' };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);

      updateBody.password = '11111111';

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /v1/users/:userId/follow', () => {
    test('should return 200 and successfully follow a user', async () => {
      await insertUsers([userOne, userTwo]);

      const res = await request(app)
        .post(`/v1/users/${userTwo._id}/follow`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('following');
      expect(res.body.following).toContain(userTwo._id.toHexString());

      // Verify userTwo has userOne in followers
      const dbUserTwo = await User.findById(userTwo._id);
      expect(dbUserTwo?.followers).toContainEqual(userOne._id);
    });

    test('should return 401 if not authenticated', async () => {
      await insertUsers([userTwo]);

      await request(app).post(`/v1/users/${userTwo._id}/follow`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 if trying to follow yourself', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post(`/v1/users/${userOne._id}/follow`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if already following the user', async () => {
      await insertUsers([userOne, userTwo]);

      // First follow
      await request(app)
        .post(`/v1/users/${userTwo._id}/follow`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      // Try to follow again
      await request(app)
        .post(`/v1/users/${userTwo._id}/follow`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 if user to follow does not exist', async () => {
      await insertUsers([userOne]);
      const fakeUserId = new mongoose.Types.ObjectId();

      await request(app)
        .post(`/v1/users/${fakeUserId}/follow`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 if userId is not a valid mongo id', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post(`/v1/users/invalidId/follow`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /v1/users/:userId/unfollow', () => {
    test('should return 200 and successfully unfollow a user', async () => {
      await insertUsers([userOne, userTwo]);

      // First follow the user
      await request(app)
        .post(`/v1/users/${userTwo._id}/follow`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      // Then unfollow
      const res = await request(app)
        .post(`/v1/users/${userTwo._id}/unfollow`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('following');
      expect(res.body.following).not.toContain(userTwo._id.toHexString());

      // Verify userTwo doesn't have userOne in followers
      const dbUserTwo = await User.findById(userTwo._id);
      expect(dbUserTwo?.followers).not.toContainEqual(userOne._id);
    });

    test('should return 401 if not authenticated', async () => {
      await insertUsers([userTwo]);

      await request(app).post(`/v1/users/${userTwo._id}/unfollow`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 if trying to unfollow yourself', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post(`/v1/users/${userOne._id}/unfollow`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if not following the user', async () => {
      await insertUsers([userOne, userTwo]);

      await request(app)
        .post(`/v1/users/${userTwo._id}/unfollow`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 if user to unfollow does not exist', async () => {
      await insertUsers([userOne]);
      const fakeUserId = new mongoose.Types.ObjectId();

      await request(app)
        .post(`/v1/users/${fakeUserId}/unfollow`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 if userId is not a valid mongo id', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post(`/v1/users/invalidId/unfollow`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should allow multiple users to follow the same user', async () => {
      const userThree = {
        _id: new mongoose.Types.ObjectId(),
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password,
        role: 'user',
        isEmailVerified: false,
      };
      const userThreeAccessToken = tokenService.generateToken(userThree._id, accessTokenExpires, tokenTypes.ACCESS);

      await insertUsers([userOne, userTwo, userThree]);

      // UserOne follows userTwo
      await request(app)
        .post(`/v1/users/${userTwo._id}/follow`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      // UserThree also follows userTwo
      await request(app)
        .post(`/v1/users/${userTwo._id}/follow`)
        .set('Authorization', `Bearer ${userThreeAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      // Verify userTwo has both followers
      const dbUserTwo = await User.findById(userTwo._id);
      expect(dbUserTwo?.followers).toHaveLength(2);
      expect(dbUserTwo?.followers).toContainEqual(userOne._id);
      expect(dbUserTwo?.followers).toContainEqual(userThree._id);
    });

    test('should allow a user to follow multiple users', async () => {
      const userThree = {
        _id: new mongoose.Types.ObjectId(),
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password,
        role: 'user',
        isEmailVerified: false,
      };

      await insertUsers([userOne, userTwo, userThree]);

      // UserOne follows userTwo
      await request(app)
        .post(`/v1/users/${userTwo._id}/follow`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      // UserOne also follows userThree
      const res = await request(app)
        .post(`/v1/users/${userThree._id}/follow`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      // Verify userOne is following both users
      expect(res.body.following).toHaveLength(2);
      expect(res.body.following).toContain(userTwo._id.toHexString());
      expect(res.body.following).toContain(userThree._id.toHexString());
    });
  });
});
