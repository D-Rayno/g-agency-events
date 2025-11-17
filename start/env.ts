import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),
  APP_NAME: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | Variables pour la session
  |----------------------------------------------------------
  */
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory'] as const),

  /*
  |----------------------------------------------------------
  | Variables pour la base de données
  |----------------------------------------------------------
  */
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables pour l'email (Brevo)
  |----------------------------------------------------------
  */
  SMTP_HOST: Env.schema.string(),
  SMTP_PORT: Env.schema.number(),
  SMTP_USERNAME: Env.schema.string(),
  SMTP_PASSWORD: Env.schema.string(),
  MAIL_FROM_ADDRESS: Env.schema.string(),
  MAIL_FROM_NAME: Env.schema.string(),
  MAIL_REPLY_TO_ADDRESS: Env.schema.string.optional(),
  MAIL_REPLY_TO_NAME: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | Variables pour l'application
  |----------------------------------------------------------
  */
  APP_URL: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables pour le stockage de fichiers
  |----------------------------------------------------------
  */
  DRIVE_DISK: Env.schema.enum(['fs'] as const),

  /*
  |----------------------------------------------------------
  | Token admin pour l'API mobile
  |----------------------------------------------------------
  */
  ADMIN_API_TOKEN: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Typesense Search Engine
  |----------------------------------------------------------
  */
  TYPESENSE_ENABLED: Env.schema.boolean.optional(),
  TYPESENSE_HOST: Env.schema.string(),
  TYPESENSE_PORT: Env.schema.string(),
  TYPESENSE_PROTOCOL: Env.schema.enum(['http', 'https'] as const),
  TYPESENSE_API_KEY: Env.schema.string(),

  TOKEN_ENCRYPTION_KEY: Env.schema.string(),
  FIREBASE_SERVICE_ACCOUNT_PATH: Env.schema.string(),
})
