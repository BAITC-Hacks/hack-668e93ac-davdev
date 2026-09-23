import { passkeyClient } from '@better-auth/passkey/client'
import { telegramClient } from 'better-auth-telegram/client'
import {
  inferAdditionalFields,
  twoFactorClient,
} from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

import { baseWSURL } from '@/config'
import { isUserRole, type UserRole } from '@/types/UserRole'
import getLocale from '@/utils/getLocale'

const normalizeAuthUser = (
  user: BetterAuthUser | null | undefined
): AuthUser | undefined => {
  if (!user || !isUserRole(user.role)) {
    return undefined
  }

  return {
    ...user,
    role: user.role,
  }
}

export const authClient = createAuthClient({
  baseURL: baseWSURL,
  basePath: '/api/auth',
  fetchOptions: {
    credentials: 'include',
    headers: {
      'x-timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    onRequest: ({ headers }) => {
      headers.set('x-locale', getLocale())
    },
  },
  plugins: [
    passkeyClient(),
    telegramClient(),
    twoFactorClient({ twoFactorPage: '/two-factor' }),
    inferAdditionalFields({
      user: {
        role: {
          type: 'string',
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
        twoFactorEnabled: {
          type: 'boolean',
          required: false,
        },
      },
    }),
  ],
})

export type Session = typeof authClient.$Infer.Session
export type BetterAuthUser = Session['user']

export type AuthUser = Omit<BetterAuthUser, 'role'> & {
  role: UserRole
}

export const useAuthSession = () => {
  const session = authClient.useSession()

  return {
    ...session,
    data: session.data
      ? {
          ...session.data,
          user: normalizeAuthUser(session.data.user),
        }
      : null,
  }
}
