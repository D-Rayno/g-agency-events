import { Env } from '@adonisjs/core/env'

// ✅ ADD - Better validation
export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'] as const),

  // ✅ IMPROVED - Add APP_URL validation
  APP_URL: Env.schema.string.optional(),

  // Database
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),

  // ✅ ADD - DB root password for Docker
  DB_ROOT_PASSWORD: Env.schema.string.optional(),

  // Session
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory'] as const),

  // Email
  SMTP_HOST: Env.schema.string.optional(),
  SMTP_PORT: Env.schema.number.optional(),
  SMTP_USERNAME: Env.schema.string.optional(),
  SMTP_PASSWORD: Env.schema.string.optional(),
  MAIL_FROM_ADDRESS: Env.schema.string.optional({ format: 'email' }),
  MAIL_FROM_NAME: Env.schema.string.optional(),
  MAIL_REPLY_TO_ADDRESS: Env.schema.string.optional({ format: 'email' }),
  MAIL_REPLY_TO_NAME: Env.schema.string.optional(),

  // Storage
  DRIVE_DISK: Env.schema.enum(['fs'] as const),

  // Admin API
  ADMIN_API_TOKEN: Env.schema.string(),
  ADMIN_TOKEN_EXPIRES_IN: Env.schema.number.optional(),

  // Typesense
  TYPESENSE_ENABLED: Env.schema.boolean.optional(),
  TYPESENSE_HOST: Env.schema.string(),
  TYPESENSE_PORT: Env.schema.string(),
  TYPESENSE_PROTOCOL: Env.schema.enum(['http', 'https'] as const),
  TYPESENSE_API_KEY: Env.schema.string(),

  // Security
  TOKEN_ENCRYPTION_KEY: Env.schema.string(), // ✅ REQUIRED now

  // Firebase
  FIREBASE_SERVICE_ACCOUNT_PATH: Env.schema.string(),
  FIREBASE_SERVICE_ACCOUNT: Env.schema.string.optional(),

  // ✅ ADD - Nginx port for Docker
  NGINX_PORT: Env.schema.number.optional(),
})
