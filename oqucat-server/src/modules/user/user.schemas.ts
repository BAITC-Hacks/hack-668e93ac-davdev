import { z } from 'zod'

import { identifierTypes } from '../../types/IdentifierType'
import { languages } from '../../types/Languages'
import { platforms } from '../../types/Platform'

export const changePasswordSchema = {
  body: z.object({
    old: z.string().min(1, 'Old password is required'),
    new: z.string().min(6, 'New password must be at least 6 characters'),
  }),
}

export const setPasswordSchema = {
  body: z.object({
    newPassword: z
      .string()
      .min(6, 'New password must be at least 6 characters'),
  }),
}

export const updateUserSchema = {
  body: z.object({
    name: z.string().min(1).optional(),

    locale: z.enum(languages).optional(),

    // IANA timezone string
    tz: z.string().min(1).optional(),
  }),
}
export const bindTelegramSchema = {
  body: z.object({
    token: z.string().min(1, 'Token is required'),
  }),
}
export const registerPushSchema = {
  body: z.object({
    installationId: z.string(),
    platform: z.enum(platforms),
    identifierType: z.enum(identifierTypes),
  }),
}
