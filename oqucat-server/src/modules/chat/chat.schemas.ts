import { z } from 'zod'

import { zodUserID } from '@/types/UserId'

export const getMessagesSchema = {
  params: z.object({
    chatUserId: zodUserID,
  }),
  query: z.object({
    cursor: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).default(50),
  }),
}

export const getChatsSchema = {
  query: z.object({
    limit: z.coerce.number().int().positive().optional(),
  }),
}
