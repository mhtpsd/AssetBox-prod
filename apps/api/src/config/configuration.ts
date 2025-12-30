export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  database: {
    url:  process.env.DATABASE_URL! ,
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },

  storage: {
    endpoint: process.env.STORAGE_ENDPOINT! ,
    region: process.env.STORAGE_REGION || 'us-east-1',
    accessKey: process.env. STORAGE_ACCESS_KEY!,
    secretKey: process.env.STORAGE_SECRET_KEY! ,
    bucketPrivate:  process.env.STORAGE_BUCKET_PRIVATE || 'assetbox-private',
    bucketPublic: process.env.STORAGE_BUCKET_PUBLIC || 'assetbox-public',
    cdnUrl: process.env.STORAGE_CDN_URL || process.env.STORAGE_ENDPOINT,
  },

  stripe:  {
    secretKey: process. env.STRIPE_SECRET_KEY!,
    webhookSecret:  process.env.STRIPE_WEBHOOK_SECRET!,
  },

  email: {
    apiKey: process.env.RESEND_API_KEY!,
    from: process.env.EMAIL_FROM || 'noreply@assetbox.com',
  },

  meilisearch: {
    host: process.env. MEILI_HOST || 'http://localhost:7700',
    apiKey: process.env.MEILI_MASTER_KEY,
  },

  platform: {
    commissionPercent: parseInt(process. env.PLATFORM_COMMISSION_PERCENT || '10', 10),
    minimumPayoutAmount: parseFloat(process.env. MINIMUM_PAYOUT_AMOUNT || '50'),
    downloadLinkExpiry:  parseInt(process.env.DOWNLOAD_LINK_EXPIRY || '900', 10),
  },
});