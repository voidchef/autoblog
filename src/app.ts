import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';
import httpStatus from 'http-status';
import passport from 'passport';
import config from './config/config';
import { jwtStrategy, googleStrategy, appleStrategy } from './modules/auth';
import { ApiError, errorConverter, errorHandler } from './modules/errors';
import { morgan, logger } from './modules/logger';
import { queueService } from './modules/queue';
import { initSubscriptionCronJobs } from './modules/subscription';
import { authLimiter } from './modules/utils';
import rootRoute from './routes/root.route';
import routes from './routes/v1';

const app: Express = express();

// Trust proxy headers when behind a reverse proxy (e.g., nginx, AWS ALB, Render)
if (config.trustProxy) {
  app.set('trust proxy', true);
}

// Initialize queue service
if (config.env !== 'test') {
  queueService
    .initialize()
    .then(() => {
      logger.info('Queue service initialized successfully');
    })
    .catch((error) => {
      logger.error('Failed to initialize queue service:', error);
    });
}

// Initialize cron jobs (only in non-test environment)
if (config.env !== 'test') {
  initSubscriptionCronJobs();
}

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// enable cors
app.use(cors());
app.options('/{*any}', cors());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);
if (googleStrategy) {
  passport.use('google', googleStrategy);
}
if (appleStrategy) {
  passport.use('apple', appleStrategy);
}

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// root routes (/, /health)
app.use('/', rootRoute);

// v1 api routes
app.use('/v1', routes);

// send back a 404 error for any unknown api request
app.use((_req, _res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

export default app;
