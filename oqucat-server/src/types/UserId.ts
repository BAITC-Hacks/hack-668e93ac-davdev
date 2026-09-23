import { z } from 'zod'

export type UserID = `${string}-${string}-${string}-${string}-${string}`

export const zodUserID = z.custom<UserID>(
  (value) => typeof value === 'string' && z.uuidv7().safeParse(value).success,
  {
    message: 'Invalid UUIDv7',
  }
)
