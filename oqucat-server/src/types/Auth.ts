import type { auth } from '../modules/auth/betterAuth'

export type AuthSession = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>

export type AuthUser = AuthSession['user']
