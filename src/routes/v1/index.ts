import express, { Router } from 'express';
import config from '../../config/config';
import oauthConnectionRoute from '../../modules/oauthConnection/oauthConnection.route';
import appSettingsRoute from './appSettings.route';
import authRoute from './auth.route';
import blogRoute from './blog.route';
import commentRoute from './comment.route';
import contactRoute from './contact.route';
import newsletterRoute from './newsletter.route';
import paymentRoute from './payment.route';
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
  {
    path: '/newsletter',
    route: newsletterRoute,
  },
  {
    path: '/oauth-connections',
    route: oauthConnectionRoute,
  },
  {
    path: '/payment',
    route: paymentRoute,
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
