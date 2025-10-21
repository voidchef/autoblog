import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import request from 'supertest';
import httpStatus from 'http-status';
import bcrypt from 'bcryptjs';
import moment from 'moment';
import app from '../../app';
import setupTestDB from '../jest/setupTestDB';
import User from '../user/user.model';
import AppSettings from './appSettings.model';
import config from '../../config/config';
import * as tokenService from '../token/token.service';
import tokenTypes from '../token/token.types';
import { ICategories, IFieldData } from './appSettings.interfaces';

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

const categoryOne: ICategories = {
  categoryName: 'Technology',
  categoryDescription: 'Latest technology trends and news',
  categoryPicUrl: 'https://example.com/tech.jpg',
};

const categoryTwo: ICategories = {
  categoryName: 'Health',
  categoryDescription: 'Health and wellness articles',
  categoryPicUrl: 'https://example.com/health.jpg',
};

const languagesData: IFieldData[] = [
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
];

const languageModelsData: IFieldData[] = [
  { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
  { label: 'GPT-4', value: 'gpt-4' },
];

const queryTypeData: IFieldData[] = [
  { label: 'Informational', value: 'informational' },
  { label: 'Transactional', value: 'transactional' },
];

const insertUsers = async (users: Record<string, any>[]) => {
  await User.insertMany(users.map((user) => ({ ...user, password: hashedPassword })));
};

const insertAppSettings = async (settings: any) => {
  await AppSettings.create(settings);
};

describe('AppSettings routes', () => {
  describe('GET /v1/appSettings', () => {
    test('should return 200 and app settings if they exist', async () => {
      const settings = {
        categories: [categoryOne, categoryTwo],
        languages: languagesData,
        languageModels: languageModelsData,
        queryType: queryTypeData,
      };
      await insertAppSettings(settings);

      const res = await request(app).get('/v1/appSettings').send().expect(httpStatus.OK);

      expect(res.body).toMatchObject({
        categories: expect.arrayContaining([
          expect.objectContaining(categoryOne),
          expect.objectContaining(categoryTwo),
        ]),
        languages: expect.arrayContaining(languagesData),
        languageModels: expect.arrayContaining(languageModelsData),
        queryType: expect.arrayContaining(queryTypeData),
      });
    });

    test('should return 200 with null if no settings exist', async () => {
      const res = await request(app).get('/v1/appSettings').send().expect(httpStatus.OK);

      // Express may serialize null as {} 
      expect(res.body === null || Object.keys(res.body).length === 0).toBe(true);
    });

    test('should not return apiKeys field', async () => {
      const settings = {
        categories: [categoryOne],
        languages: languagesData,
        languageModels: languageModelsData,
        queryType: queryTypeData,
        apiKeys: { openai: 'secret-key' },
      };
      await insertAppSettings(settings);

      const res = await request(app).get('/v1/appSettings').send().expect(httpStatus.OK);

      expect(res.body).not.toHaveProperty('apiKeys');
    });
  });

  describe('POST /v1/appSettings/categories', () => {
    test('should return 200 and successfully add categories if data is ok', async () => {
      await insertUsers([admin]);

      const res = await request(app)
        .post('/v1/appSettings/categories')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ categories: [categoryOne, categoryTwo] })
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(2);
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining(categoryOne),
          expect.objectContaining(categoryTwo),
        ])
      );

      const dbSettings = await AppSettings.findOne();
      expect(dbSettings?.categories).toHaveLength(2);
    });

    test('should return 200 and append categories to existing settings', async () => {
      await insertUsers([admin]);
      await insertAppSettings({ categories: [categoryOne] });

      const newCategory: ICategories = {
        categoryName: 'Science',
        categoryDescription: 'Science and research articles',
        categoryPicUrl: 'https://example.com/science.jpg',
      };

      const res = await request(app)
        .post('/v1/appSettings/categories')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ categories: [newCategory] })
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(2);
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining(categoryOne),
          expect.objectContaining(newCategory),
        ])
      );
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app)
        .post('/v1/appSettings/categories')
        .send({ categories: [categoryOne] })
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user does not have manageAppSettings permission', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post('/v1/appSettings/categories')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ categories: [categoryOne] })
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 error if categories array is empty', async () => {
      await insertUsers([admin]);

      await request(app)
        .post('/v1/appSettings/categories')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ categories: [] })
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if category is missing required fields', async () => {
      await insertUsers([admin]);

      const invalidCategory = {
        categoryName: 'Technology',
        // Missing categoryDescription and categoryPicUrl
      };

      await request(app)
        .post('/v1/appSettings/categories')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ categories: [invalidCategory] })
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('DELETE /v1/appSettings/categories', () => {
    test('should return 200 and successfully delete categories', async () => {
      await insertUsers([admin]);
      await insertAppSettings({
        categories: [categoryOne, categoryTwo],
      });

      const res = await request(app)
        .delete('/v1/appSettings/categories')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ categoryNames: ['Technology'] })
        .expect(httpStatus.NO_CONTENT);

      const dbSettings = await AppSettings.findOne();
      expect(dbSettings?.categories).toHaveLength(1);
      expect(dbSettings?.categories[0]?.categoryName).toBe('Health');
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app)
        .delete('/v1/appSettings/categories')
        .send({ categoryNames: ['Technology'] })
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user does not have manageAppSettings permission', async () => {
      await insertUsers([userOne]);

      await request(app)
        .delete('/v1/appSettings/categories')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ categoryNames: ['Technology'] })
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 404 error if no app settings found', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete('/v1/appSettings/categories')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ categoryNames: ['Technology'] })
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if categories array is empty', async () => {
      await insertUsers([admin]);
      await insertAppSettings({ categories: [categoryOne] });

      await request(app)
        .delete('/v1/appSettings/categories')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ categoryNames: [] })
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /v1/appSettings/selectFields', () => {
    test('should return 200 and successfully update all select fields', async () => {
      await insertUsers([admin]);

      const selectFields = {
        languages: languagesData,
        languageModels: languageModelsData,
        queryType: queryTypeData,
      };

      const res = await request(app)
        .post('/v1/appSettings/selectFields')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(selectFields)
        .expect(httpStatus.OK);

      expect(res.body).toMatchObject({
        languages: expect.arrayContaining(languagesData),
        languageModels: expect.arrayContaining(languageModelsData),
        queryType: expect.arrayContaining(queryTypeData),
      });

      const dbSettings = await AppSettings.findOne();
      expect(dbSettings?.languages).toMatchObject(languagesData);
      expect(dbSettings?.languageModels).toMatchObject(languageModelsData);
      expect(dbSettings?.queryType).toMatchObject(queryTypeData);
    });

    test('should return 200 and update only languages field', async () => {
      await insertUsers([admin]);
      await insertAppSettings({
        languages: [{ label: 'French', value: 'fr' }],
        languageModels: languageModelsData,
        queryType: queryTypeData,
      });

      const res = await request(app)
        .post('/v1/appSettings/selectFields')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ languages: languagesData })
        .expect(httpStatus.OK);

      expect(res.body.languages).toEqual(expect.arrayContaining(languagesData));
      expect(res.body.languageModels).toEqual(expect.arrayContaining(languageModelsData));
      expect(res.body.queryType).toEqual(expect.arrayContaining(queryTypeData));
    });

    test('should return 200 and update only languageModels field', async () => {
      await insertUsers([admin]);
      await insertAppSettings({
        languages: languagesData,
        languageModels: [{ label: 'Claude', value: 'claude-3' }],
        queryType: queryTypeData,
      });

      const res = await request(app)
        .post('/v1/appSettings/selectFields')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ languageModels: languageModelsData })
        .expect(httpStatus.OK);

      expect(res.body.languages).toEqual(expect.arrayContaining(languagesData));
      expect(res.body.languageModels).toEqual(expect.arrayContaining(languageModelsData));
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app)
        .post('/v1/appSettings/selectFields')
        .send({ languages: languagesData })
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user does not have manageAppSettings permission', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post('/v1/appSettings/selectFields')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ languages: languagesData })
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 error if select field data is invalid', async () => {
      await insertUsers([admin]);

      const invalidData = {
        languages: [{ label: 'English' }], // Missing value
      };

      await request(app)
        .post('/v1/appSettings/selectFields')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(invalidData)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('AppSettings service functions', () => {
    test('should create new app settings if none exist', async () => {
      const settings = {
        categories: [categoryOne],
        languages: languagesData,
        languageModels: languageModelsData,
        queryType: queryTypeData,
      };
      await insertAppSettings(settings);

      const dbSettings = await AppSettings.findOne();
      expect(dbSettings).toBeDefined();
      expect(dbSettings?.categories).toHaveLength(1);
      expect(dbSettings?.categories[0]).toMatchObject(categoryOne);
    });

    test('should update existing app settings', async () => {
      await insertAppSettings({
        categories: [categoryOne],
        languages: [{ label: 'French', value: 'fr' }],
        languageModels: languageModelsData,
        queryType: queryTypeData,
      });

      const dbSettings = await AppSettings.findOne();
      if (dbSettings) {
        dbSettings.languages = languagesData;
        await dbSettings.save();
      }

      const updatedSettings = await AppSettings.findOne();
      expect(updatedSettings?.languages).toMatchObject(languagesData);
    });
  });
});
