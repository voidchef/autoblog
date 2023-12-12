import express, { Router } from 'express';
import { validate } from '../../modules/validate';
import { auth } from '../../modules/auth';
import { appSettingsController, appSettingsValidation } from '../../modules/appSettings';

const router: Router = express.Router();

router.get('/', appSettingsController.getAppSettings);

router
  .route('/apiKeys')
  .get(appSettingsController.getApiKeys)
  .post(auth('manageAppSettings'), validate(appSettingsValidation.updateApiKeys), appSettingsController.updateApiKeys);

router
  .route('/categories')
  .post(auth('manageAppSettings'), validate(appSettingsValidation.updateCategories), appSettingsController.updateCategories)
  .delete(
    auth('manageAppSettings'),
    validate(appSettingsValidation.deleteCategories),
    appSettingsController.deleteCategories,
  );

router
  .route('/selectFields')
  .post(
    auth('manageAppSettings'),
    validate(appSettingsValidation.updateSelectFields),
    appSettingsController.updateSelectFields,
  );

export default router;
