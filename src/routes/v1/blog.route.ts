import express, { Router } from 'express';
import { validate } from '../../modules/validate';
import { auth } from '../../modules/auth';
import { blogController, blogValidation } from '../../modules/blog';

const router: Router = express.Router();

router
  .route('/')
  .post(auth('generateBlogs'), validate(blogValidation.generateBlog), blogController.generateBlog)
  .get(validate(blogValidation.getBlogs), blogController.getBlogs);

router.route('/views').get(auth('getViews'), validate(blogValidation.getViews), blogController.getViews);

router
  .route('/:blogId')
  .get(validate(blogValidation.getBlog), blogController.getBlog)
  .patch(auth('manageBlogs'), validate(blogValidation.updateBlog), blogController.updateBlog)
  .delete(auth('manageBlogs'), validate(blogValidation.deleteBlog), blogController.deleteBlog);

export default router;
