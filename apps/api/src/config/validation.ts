import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi. number().default(3001),

  DATABASE_URL: Joi.string().required(),

  NEXTAUTH_SECRET: Joi. string().required(),

  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT:  Joi.number().default(6379),

  STORAGE_ENDPOINT: Joi. string().required(),
  STORAGE_ACCESS_KEY: Joi.string().required(),
  STORAGE_SECRET_KEY:  Joi.string().required(),
  STORAGE_BUCKET_PRIVATE: Joi. string().required(),
  STORAGE_BUCKET_PUBLIC:  Joi.string().required(),

  STRIPE_SECRET_KEY: Joi.string().required(),
  STRIPE_WEBHOOK_SECRET: Joi.string().required(),

  MEILISEARCH_HOST:  Joi.string().required(),
  MEILISEARCH_API_KEY:  Joi.string().required(),

  RESEND_API_KEY: Joi. string().required(),
  EMAIL_FROM:  Joi.string().email().required(),

  PLATFORM_COMMISSION_PERCENT:  Joi.number().default(10),
  MINIMUM_PAYOUT_AMOUNT:  Joi.number().default(50),
});