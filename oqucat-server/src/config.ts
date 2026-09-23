// oxlint-disable node/no-process-env
import path from 'node:path'

import dotenv from 'dotenv'
import { z } from 'zod'

import { parseFirebaseServiceAccount } from './utils/parseFirebase'

const envFile =
  process.env.NODE_ENV === 'production' ? '.env.production' : '.env'

dotenv.config({ path: path.resolve(process.cwd(), envFile) })

const requiredString = z.string().refine((value) => value.trim().length > 0)
const requiredNumber = requiredString
  .transform(Number)
  .refine(Number.isFinite, 'Must be a number')

const cfg = z
  .object({
    DEV: requiredString.transform((value) => value === 'true'),
    PORT: requiredNumber,
    APP_NAME: requiredString,
    LOG_LEVEL: requiredString.default('info'),
    DATA_DIR: requiredString,
    SECRET_KEY: requiredString,

    CLIENT: requiredString,
    SERVER: requiredString,

    DB_NAME: requiredString,
    DB_USER: requiredString,
    DB_PASSWORD: requiredString,
    DB_HOST: requiredString,
    DB_PORT: requiredNumber,

    LLM_KEY: requiredString,
    LLM_HOST: requiredString,
    LLM_MODEL: requiredString,
    LLM_TRANSCRIPTION_MODEL: z.string().default('gpt-4o-mini-transcribe'),
    LLM_REALTIME_MODEL: requiredString,
    LLM_TTS_MODEL: requiredString,
    LLM_TTS_VOICE: requiredString,

    BETTER_AUTH_SECRET: requiredString,
    BETTER_AUTH_URL: requiredString,

    ROOT_EMAIL: requiredString,
    ROOT_PASSWORD: requiredString,

    TG_KEY: requiredString,
    TG_USERNAME: requiredString,
    TG_OIDC_CLIENT_ID: requiredString,
    TG_OIDC_CLIENT_SECRET: requiredString,

    CLOUDFLARE_SITE_KEY: requiredString,
    CLOUDFLARE_SITE_SECRET: requiredString,

    GITHUB_CLIENT_ID: requiredString,
    GITHUB_CLIENT_SECRET: requiredString,

    FACEBOOK_CLIENT_ID: requiredString,
    FACEBOOK_CLIENT_SECRET: requiredString,

    GOOGLE_ANDROID_CLIENT_ID: requiredString,
    GOOGLE_WEB_CLIENT_ID: requiredString,
    GOOGLE_CLIENT_SECRET: requiredString,

    FIREBASE_SERVICE_ACCOUNT: requiredString.transform(
      parseFirebaseServiceAccount
    ),
  })
  .parse(process.env)

export const trustedOrigins = [
  cfg.CLIENT,
  'http://tauri.localhost',
  'https://tauri.localhost',
  'tauri://localhost',
]

export default cfg
