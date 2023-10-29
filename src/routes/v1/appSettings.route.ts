import express, { Router } from 'express';
import { validate } from '../../modules/validate';
// import { auth } from '../../modules/auth';
import { appSettingsController, appSettingsValidation } from '../../modules/appSettings';

const router: Router = express.Router();

router.get('/', appSettingsController.getAppSettings);

router
  .route('/apiKeys')
  .get(appSettingsController.getApiKeys)
  .post(validate(appSettingsValidation.updateApiKeys), appSettingsController.updateApiKeys);

router
  .route('/categories')
  .post(validate(appSettingsValidation.updateCategories), appSettingsController.updateCategories)
  .delete(validate(appSettingsValidation.deleteCategories), appSettingsController.deleteCategories);

export default router;
