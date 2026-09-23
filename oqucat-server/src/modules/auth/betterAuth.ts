import { passkey } from '@better-auth/passkey'
import { betterAuth } from 'better-auth'
import { telegram } from 'better-auth-telegram'
import { createAuthMiddleware } from 'better-auth/api'
import {
  admin,
  captcha,
  haveIBeenPwned,
  openAPI,
  twoFactor,
} from 'better-auth/plugins'
import { Pool } from 'pg'
import { uuidv7 } from 'uuidv7'

import { logger } from '@/logger'
import { isLanguage } from '@/utils/isLanguage'
import { isRecord } from '@/utils/isRecord'
import { replaceExternalAvatar } from '@/utils/replaceExternalAvatar'

import cfg, { trustedOrigins } from '../../config'
import { emitEmailVerified } from '../../sio'
import type { Language } from '../../types/Languages'
import { UserRole } from '../../types/UserRole'
import { updateUserLocaleTz } from '../../utils/updateUserLocaleTz'
import {
  sendConfirmationEmail,
  sendResetPasswordEmail,
} from '../email/confEmail'
import bot from '../telegram/bot'
import { User } from '../user/User.model'
import { emailVerificationSession } from './emailVerificationSession'

const authPool = new Pool({
  host: cfg.DB_HOST,
  port: cfg.DB_PORT,
  user: cfg.DB_USER,
  password: cfg.DB_PASSWORD,
  database: cfg.DB_NAME,
})

export const auth = betterAuth({
  basePath: '/api/auth',
  baseURL: cfg.BETTER_AUTH_URL,
  database: authPool,
  trustedOrigins,
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      '/sign-in/email': {
        window: 60,
        max: 5,
      },
      '/sign-up/email': {
        window: 60,
        max: 3,
      },
    },
  },
  advanced: {
    // disableOriginCheck: true,
    ipAddress: {
      ipAddressHeaders: ['x-real-ip'],
    },
    database: {
      generateId: () => uuidv7(),
    },
    cookies: {
      session_token: {
        attributes: {
          sameSite: 'none',
          secure: true,
        },
      },
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: true,
        defaultValue: UserRole.UNASSIGNED,
      },
      company_id: {
        type: 'number',
        required: false,
      },
      locale: {
        type: 'string',
        required: false,
      },
      tz: {
        type: 'string',
        required: false,
      },
      telegramId: {
        type: 'string',
        required: false,
      },
      telegramUsername: {
        type: 'string',
        required: false,
      },
      telegramPhoneNumber: {
        type: 'string',
        required: false,
      },
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      allowDifferentEmails: true,
      trustedProviders: ['telegram-oidc', 'facebook', 'github'],
      updateUserInfoOnLink: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, token }) => {
      const { locale } = user as typeof user & { locale?: Language }
      await sendResetPasswordEmail(user.email, token, locale)
    },
    // revokeSessionsOnPasswordReset: true,
  },
  socialProviders: {
    google: {
      clientId: [cfg.GOOGLE_WEB_CLIENT_ID, cfg.GOOGLE_ANDROID_CLIENT_ID],
      clientSecret: cfg.GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: cfg.GITHUB_CLIENT_ID,
      clientSecret: cfg.GITHUB_CLIENT_SECRET,
    },
    facebook: {
      clientId: cfg.FACEBOOK_CLIENT_ID,
      clientSecret: cfg.FACEBOOK_CLIENT_SECRET,
    },
  },

  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      logger.debug(ctx.path)
      if (!ctx.path.startsWith('/sign-in') || !ctx.context.newSession) {
        return
      }
      const body = isRecord(ctx.body) ? ctx.body : {}
      const additionalData = isRecord(body.additionalData)
        ? body.additionalData
        : {}
      const localeHeader = ctx.headers?.get('x-locale')
      const timezoneHeader = ctx.headers?.get('x-timezone')
      const localeValue = body.locale ?? additionalData.locale ?? localeHeader
      const tzValue = body.tz ?? additionalData.tz ?? timezoneHeader
      const locale = isLanguage(localeValue) ? localeValue : undefined
      const tz = typeof tzValue === 'string' && tzValue ? tzValue : undefined

      if (!locale && !tz) {
        return
      }

      try {
        const user = await User.findByPk(ctx.context.newSession.user.id)

        if (user) {
          await updateUserLocaleTz(user, locale, tz)
        }
      } catch (error) {
        logger.error({ error }, 'Failed to update user locale and timezone')
      }
    }),
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      const { locale } = user as typeof user & { locale?: Language }
      await sendConfirmationEmail(user.email, url, locale)
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    afterEmailVerification: (user) =>
      Promise.resolve(emitEmailVerified(user.id, user.email)),
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user, ctx) => {
          if (!user.image || !ctx) {
            return
          }

          await replaceExternalAvatar(user.id, user.image)
          // ctx.context.runInBackground(
          // )
        },
      },
      update: {
        after: async (user, ctx) => {
          if (!user.image || !ctx) {
            return
          }

          await replaceExternalAvatar(user.id, user.image)
          // ctx.context.runInBackground(
          // )
        },
      },
    },
  },

  plugins: [
    emailVerificationSession(),
    passkey({
      rpID: new URL(cfg.CLIENT).hostname,
      rpName: cfg.APP_NAME,
      origin: cfg.CLIENT,
    }),
    haveIBeenPwned(),
    openAPI(),
    twoFactor({
      issuer: cfg.APP_NAME,
      allowPasswordless: true,
    }),
    captcha({
      provider: 'cloudflare-turnstile',
      secretKey: cfg.CLOUDFLARE_SITE_SECRET,
    }),
    admin({
      defaultRole: UserRole.UNASSIGNED,
      adminRoles: [UserRole.SUPERADMIN],
      roles: {
        [UserRole.UNASSIGNED]: {
          statements: {},
          authorize: () => ({
            success: false,
            error: 'Role assignment required',
          }),
        },
        [UserRole.USER]: {
          statements: {},
          authorize: () => ({
            success: false,
            error: 'RBAC off',
          }),
        },
        [UserRole.BUSINESS]: {
          statements: {},
          authorize: () => ({
            success: false,
            error: 'RBAC off',
          }),
        },
        [UserRole.SUPERADMIN]: {
          statements: {},
          authorize: () => ({
            success: false,
            error: 'RBAC off',
          }),
        },
      },
    }),
    telegram({
      loginWidget: false,

      oidc: {
        enabled: true,
        clientId: cfg.TG_OIDC_CLIENT_ID,
        clientSecret: cfg.TG_OIDC_CLIENT_SECRET,
        requestBotAccess: true,
        requestPhone: true,
        mapOIDCProfileToUser: (profile) => {
          try {
            void bot.api.sendMessage(
              String(profile.id),
              'Your Telegram account has been linked to OquCat!'
            )
          } catch (error) {
            logger.error(error)
          }
          return {
            telegramId: String(profile.id),
            telegramUsername: profile.preferred_username ?? null,
            telegramPhoneNumber: profile.phone_number ?? null,
          }
        },
      },
    }),
  ],
})
