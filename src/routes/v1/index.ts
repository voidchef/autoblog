import express, { Router } from 'express';
import config from '../../config/config';
import appSettingsRoute from './appSettings.route';
import authRoute from './auth.route';
import blogRoute from './blog.route';
import commentRoute from './comment.route';
import contactRoute from './contact.route';
import docsRoute from './swagger.route';
import userRoute from './user.route';

const router = express.Router();

interface IRoute {
  path: string;
  route: Router;
}

const defaultIRoute: IRoute[] = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/blogs',
    route: blogRoute,
  },
  {
    path: '/comments',
    route: commentRoute,
  },
  {
    path: '/appSettings',
    route: appSettingsRoute,
  },
  {
    path: '/contact',
    route: contactRoute,
  },
];

const devIRoute: IRoute[] = [
  // IRoute available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultIRoute.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devIRoute.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
