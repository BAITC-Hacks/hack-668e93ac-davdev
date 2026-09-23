import { z } from 'zod'

import { languages } from '../../types/Languages'

export const telegramCodeRequestSchema = {
  body: z.object({
    email: z.email(),
  }),
}

export const telegramVerifySchema = {
  body: z.object({
    code: z.string().length(6),
    locale: z.enum(languages).optional(),
    tz: z.string().optional(),
  }),
}

export const checkEmailSchema = {
  body: z.object({
    email: z.email(),
  }),
}
