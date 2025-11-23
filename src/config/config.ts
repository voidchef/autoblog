import Joi from 'joi';
import 'dotenv/config';

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    JWT_REMEMBER_ME_EXPIRATION_DAYS: Joi.number()
      .default(90)
      .description('days after which remember me refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which verify email token expires'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
    CLIENT_URL: Joi.string().required().description('Frontend client URL'),
    SERVER_URL: Joi.string().description('Backend server URL for OAuth callbacks'),
    GOOGLE_CLIENT_ID: Joi.string().description('Google OAuth client ID'),
    GOOGLE_CLIENT_SECRET: Joi.string().description('Google OAuth client secret'),
    APPLE_CLIENT_ID: Joi.string().description('Apple OAuth client ID (Service ID)'),
    APPLE_TEAM_ID: Joi.string().description('Apple Team ID'),
    APPLE_KEY_ID: Joi.string().description('Apple Key ID'),
    APPLE_PRIVATE_KEY_PATH: Joi.string().description('Path to Apple private key file'),
    RAZORPAY_KEY_ID: Joi.string().description('Razorpay API Key ID'),
    RAZORPAY_KEY_SECRET: Joi.string().description('Razorpay API Key Secret'),
    RAZORPAY_WEBHOOK_SECRET: Joi.string().description('Razorpay Webhook Secret'),
    CACHE_TYPE: Joi.string().valid('redis', 'memory').default('memory').description('Cache type: redis or memory'),
    REDIS_HOST: Joi.string().default('localhost').description('Redis host'),
    REDIS_PORT: Joi.number().default(6379).description('Redis port'),
    REDIS_USERNAME: Joi.string().allow('').description('Redis username'),
    REDIS_PASSWORD: Joi.string().allow('').description('Redis password'),
    REDIS_DB: Joi.number().default(0).description('Redis database number'),
    REDIS_TLS: Joi.boolean().default(false).description('Enable TLS for Redis connection'),
    CACHE_TTL: Joi.number().default(3600).description('Default cache TTL in seconds'),
    TRUST_PROXY: Joi.boolean().default(false).description('Trust proxy headers (X-Forwarded-For, etc.)'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    rememberMeExpirationDays: envVars.JWT_REMEMBER_ME_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
    cookieOptions: {
      httpOnly: true,
      secure: envVars.NODE_ENV === 'production',
      signed: true,
    },
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
  clientUrl: envVars.CLIENT_URL,
  oauth: {
    google: {
      clientId: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      callbackUrl: `${envVars.SERVER_URL}/v1/auth/google/callback`,
    },
    apple: {
      clientId: envVars.APPLE_CLIENT_ID,
      teamId: envVars.APPLE_TEAM_ID,
      keyId: envVars.APPLE_KEY_ID,
      privateKeyPath: envVars.APPLE_PRIVATE_KEY_PATH,
      callbackUrl: `${envVars.SERVER_URL}/v1/auth/apple/callback`,
    },
  },
  razorpay: {
    keyId: envVars.RAZORPAY_KEY_ID,
    keySecret: envVars.RAZORPAY_KEY_SECRET,
    webhookSecret: envVars.RAZORPAY_WEBHOOK_SECRET,
  },
  cache: {
    type: envVars.CACHE_TYPE as 'redis' | 'memory',
    redis:
      envVars.CACHE_TYPE === 'redis'
        ? {
            host: envVars.REDIS_HOST,
            port: envVars.REDIS_PORT,
            username: envVars.REDIS_USERNAME || undefined,
            password: envVars.REDIS_PASSWORD || undefined,
            db: envVars.REDIS_DB,
            tls: envVars.REDIS_TLS,
          }
        : undefined,
    defaultTTL: envVars.CACHE_TTL,
  },
  trustProxy: envVars.TRUST_PROXY,
};

export default config;
