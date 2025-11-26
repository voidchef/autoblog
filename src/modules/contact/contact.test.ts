import { faker } from '@faker-js/faker';
import { jest } from '@jest/globals';
import bcrypt from 'bcryptjs';
import httpStatus from 'http-status';
import moment from 'moment';
import mongoose from 'mongoose';

// Mock email service BEFORE importing app
jest.mock('../email/email.service');

import request from 'supertest';
import app from '../../app';
import config from '../../config/config';
import setupTestDB from '../jest/setupTestDB';
import * as tokenService from '../token/token.service';
import tokenTypes from '../token/token.types';
import User from '../user/user.model';
import Contact from './contact.model';
import QueryType from './queryType.model';

setupTestDB();

const password = 'password1';
const salt = bcrypt.genSaltSync(8);
const hashedPassword = bcrypt.hashSync(password, salt);
const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');

const admin = {
  _id: new mongoose.Types.ObjectId(),
  name: faker.person.fullName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: 'admin',
  isEmailVerified: true,
};

const user = {
  _id: new mongoose.Types.ObjectId(),
  name: faker.person.fullName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: 'user',
  isEmailVerified: true,
};

const adminAccessToken = tokenService.generateToken(admin._id, accessTokenExpires, tokenTypes.ACCESS);
const userAccessToken = tokenService.generateToken(user._id, accessTokenExpires, tokenTypes.ACCESS);

const queryTypeOne = {
  _id: new mongoose.Types.ObjectId(),
  value: 'support',
  label: 'Technical Support',
  description: 'Need help with technical issues',
  isActive: true,
  order: 1,
};

const queryTypeTwo = {
  _id: new mongoose.Types.ObjectId(),
  value: 'sales',
  label: 'Sales Inquiry',
  description: 'Questions about pricing and plans',
  isActive: true,
  order: 2,
};

const contactOne = {
  _id: new mongoose.Types.ObjectId(),
  name: faker.person.fullName(),
  email: faker.internet.email().toLowerCase(),
  queryType: 'support',
  message: faker.lorem.paragraph(),
  status: 'new',
};

const contactTwo = {
  _id: new mongoose.Types.ObjectId(),
  name: faker.person.fullName(),
  email: faker.internet.email().toLowerCase(),
  queryType: 'sales',
  message: faker.lorem.paragraph(),
  status: 'in-progress',
};

const insertUsers = async (users: Record<string, any>[]) => {
  await User.insertMany(users.map((user) => ({ ...user, password: hashedPassword })));
};

const insertQueryTypes = async (queryTypes: Record<string, any>[]) => {
  await QueryType.insertMany(queryTypes);
};

const insertContacts = async (contacts: Record<string, any>[]) => {
  await Contact.insertMany(contacts);
};

describe('Contact routes', () => {
  describe('POST /v1/contact', () => {
    let newContact: any;

    beforeEach(async () => {
      await insertQueryTypes([queryTypeOne, queryTypeTwo]);
      newContact = {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        queryType: 'support',
        message: faker.lorem.paragraph(2),
      };
    });

    test('should return 201 and successfully create contact if data is valid', async () => {
      const res = await request(app).post('/v1/contact').send(newContact).expect(httpStatus.CREATED);

      expect(res.body).toEqual(
        expect.objectContaining({
          id: expect.anything(),
          name: newContact.name,
          email: newContact.email,
          queryType: newContact.queryType,
          message: newContact.message,
          status: 'new',
        })
      );

      const dbContact = await Contact.findById(res.body.id);
      expect(dbContact).toBeDefined();
      expect(dbContact).toMatchObject({
        name: newContact.name,
        email: newContact.email,
        queryType: newContact.queryType,
        message: newContact.message,
        status: 'new',
      });
    }, 10000);

    test('should return 400 if name is missing', async () => {
      delete newContact.name;
      await request(app).post('/v1/contact').send(newContact).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if name is too short', async () => {
      newContact.name = 'A';
      await request(app).post('/v1/contact').send(newContact).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if name is too long', async () => {
      newContact.name = faker.string.alpha(101);
      await request(app).post('/v1/contact').send(newContact).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if email is missing', async () => {
      delete newContact.email;
      await request(app).post('/v1/contact').send(newContact).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if email is invalid', async () => {
      newContact.email = 'invalid-email';
      await request(app).post('/v1/contact').send(newContact).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if queryType is missing', async () => {
      delete newContact.queryType;
      await request(app).post('/v1/contact').send(newContact).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if message is missing', async () => {
      delete newContact.message;
      await request(app).post('/v1/contact').send(newContact).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if message is too short', async () => {
      newContact.message = 'Short';
      await request(app).post('/v1/contact').send(newContact).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if message is too long', async () => {
      newContact.message = faker.string.alpha(2001);
      await request(app).post('/v1/contact').send(newContact).expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/contact', () => {
    beforeEach(async () => {
      await insertUsers([admin]);
      await insertContacts([contactOne, contactTwo]);
    });

    test('should return 200 and apply default query options', async () => {
      const res = await request(app)
        .get('/v1/contact')
        .set('Authorization', `Bearer ${adminAccessToken}`)
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
      expect(res.body.results[0]).toHaveProperty('id');
      expect(res.body.results[0]).toHaveProperty('name');
      expect(res.body.results[0]).toHaveProperty('email');
      expect(res.body.results[0]).toHaveProperty('queryType');
      expect(res.body.results[0]).toHaveProperty('status');
    });

    test('should return 401 if access token is missing', async () => {
      await request(app).get('/v1/contact').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if non-admin tries to access', async () => {
      await insertUsers([user]);
      await request(app)
        .get('/v1/contact')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should correctly apply filter on status field', async () => {
      const res = await request(app)
        .get('/v1/contact')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ status: 'new' })
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
      expect(res.body.results[0].id).toBe(contactOne._id.toHexString());
    });

    test('should correctly sort returned array if descending sort param is specified', async () => {
      const res = await request(app)
        .get('/v1/contact')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'createdAt:desc' })
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
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertContacts([
        {
          _id: new mongoose.Types.ObjectId(),
          name: faker.person.fullName(),
          email: faker.internet.email().toLowerCase(),
          queryType: 'support',
          message: faker.lorem.paragraph(),
          status: 'new',
        },
      ]);

      const res = await request(app)
        .get('/v1/contact')
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
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertContacts([
        {
          _id: new mongoose.Types.ObjectId(),
          name: faker.person.fullName(),
          email: faker.internet.email().toLowerCase(),
          queryType: 'support',
          message: faker.lorem.paragraph(),
          status: 'new',
        },
      ]);

      const res = await request(app)
        .get('/v1/contact')
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
    });
  });

  describe('GET /v1/contact/:contactId', () => {
    beforeEach(async () => {
      await insertUsers([admin]);
      await insertContacts([contactOne]);
    });

    test('should return 200 and the contact object if data is ok', async () => {
      const res = await request(app)
        .get(`/v1/contact/${contactOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual(
        expect.objectContaining({
          id: contactOne._id.toHexString(),
          name: contactOne.name,
          email: contactOne.email,
          queryType: contactOne.queryType,
          message: contactOne.message,
          status: contactOne.status,
        })
      );
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).get(`/v1/contact/${contactOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if non-admin user is trying to access', async () => {
      await insertUsers([user]);
      await request(app)
        .get(`/v1/contact/${contactOne._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 error if contactId is not a valid mongo id', async () => {
      await request(app)
        .get('/v1/contact/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if contact is not found', async () => {
      await request(app)
        .get(`/v1/contact/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/contact/:contactId', () => {
    beforeEach(async () => {
      await insertUsers([admin]);
      await insertContacts([contactOne]);
    });

    test('should return 200 and successfully update contact status', async () => {
      const updateBody = { status: 'in-progress' };

      const res = await request(app)
        .patch(`/v1/contact/${contactOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toEqual(
        expect.objectContaining({
          id: contactOne._id.toHexString(),
          status: 'in-progress',
        })
      );

      const dbContact = await Contact.findById(contactOne._id);
      expect(dbContact).toBeDefined();
      expect(dbContact?.status).toBe('in-progress');
    });

    test('should return 401 error if access token is missing', async () => {
      const updateBody = { status: 'resolved' };
      await request(app).patch(`/v1/contact/${contactOne._id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if non-admin user is trying to update', async () => {
      await insertUsers([user]);
      const updateBody = { status: 'resolved' };
      await request(app)
        .patch(`/v1/contact/${contactOne._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 404 if contact is not found', async () => {
      const updateBody = { status: 'resolved' };
      await request(app)
        .patch(`/v1/contact/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if status is invalid', async () => {
      const updateBody = { status: 'invalid-status' };
      await request(app)
        .patch(`/v1/contact/${contactOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if contactId is not a valid mongo id', async () => {
      const updateBody = { status: 'resolved' };
      await request(app)
        .patch('/v1/contact/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('DELETE /v1/contact/:contactId', () => {
    beforeEach(async () => {
      await insertUsers([admin]);
      await insertContacts([contactOne]);
    });

    test('should return 204 if data is ok', async () => {
      await request(app)
        .delete(`/v1/contact/${contactOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbContact = await Contact.findById(contactOne._id);
      expect(dbContact).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).delete(`/v1/contact/${contactOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if non-admin user is trying to delete', async () => {
      await insertUsers([user]);
      await request(app)
        .delete(`/v1/contact/${contactOne._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 error if contactId is not a valid mongo id', async () => {
      await request(app)
        .delete('/v1/contact/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if contact is not found', async () => {
      await request(app)
        .delete(`/v1/contact/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('GET /v1/contact/query-types', () => {
    beforeEach(async () => {
      await insertQueryTypes([queryTypeOne, queryTypeTwo]);
    });

    test('should return 200 and all active query types', async () => {
      const res = await request(app).get('/v1/contact/query-types').send().expect(httpStatus.OK);

      expect(res.body).toEqual(expect.any(Array));
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toEqual(
        expect.objectContaining({
          id: queryTypeOne._id.toHexString(),
          value: queryTypeOne.value,
          label: queryTypeOne.label,
          isActive: true,
        })
      );
    });

    test('should only return active query types by default', async () => {
      await QueryType.create({
        value: 'inactive',
        label: 'Inactive Type',
        isActive: false,
        order: 3,
      });

      const res = await request(app).get('/v1/contact/query-types').send().expect(httpStatus.OK);

      expect(res.body).toHaveLength(2);
      expect(res.body.every((qt: any) => qt.isActive)).toBe(true);
    });

    test('should return inactive query types if includeInactive is true', async () => {
      await QueryType.create({
        value: 'inactive',
        label: 'Inactive Type',
        isActive: false,
        order: 3,
      });

      const res = await request(app)
        .get('/v1/contact/query-types')
        .query({ includeInactive: true })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(3);
    });

    test('should return query types sorted by order', async () => {
      const res = await request(app).get('/v1/contact/query-types').send().expect(httpStatus.OK);

      expect(res.body[0].order).toBeLessThanOrEqual(res.body[1].order);
    });
  });

  describe('POST /v1/contact/query-types', () => {
    let newQueryType: any;

    beforeEach(async () => {
      await insertUsers([admin]);
      newQueryType = {
        value: 'feedback',
        label: 'Feedback',
        description: 'General feedback',
        isActive: true,
        order: 1,
      };
    });

    test('should return 201 and successfully create query type if admin', async () => {
      const res = await request(app)
        .post('/v1/contact/query-types')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newQueryType)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual(
        expect.objectContaining({
          id: expect.anything(),
          value: newQueryType.value,
          label: newQueryType.label,
          description: newQueryType.description,
          isActive: newQueryType.isActive,
          order: newQueryType.order,
        })
      );

      const dbQueryType = await QueryType.findById(res.body.id);
      expect(dbQueryType).toBeDefined();
    });

    test('should return 401 if access token is missing', async () => {
      await request(app).post('/v1/contact/query-types').send(newQueryType).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if non-admin tries to create query type', async () => {
      await insertUsers([user]);
      await request(app)
        .post('/v1/contact/query-types')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(newQueryType)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 if value is missing', async () => {
      delete newQueryType.value;
      await request(app)
        .post('/v1/contact/query-types')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newQueryType)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if label is missing', async () => {
      delete newQueryType.label;
      await request(app)
        .post('/v1/contact/query-types')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newQueryType)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
