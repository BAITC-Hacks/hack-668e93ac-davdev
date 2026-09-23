import { z } from 'zod'

import { zodUserID } from '../../types/UserId'

export const pointHistoryQuerySchema = {
  query: z.object({
    limit: z.coerce.number().int().min(1).max(100).default(50),
  }),
}

export const studentPointsSchema = {
  params: z.object({ studentId: zodUserID }),
  query: pointHistoryQuerySchema.query,
}

export const teamPointsSchema = {
  params: z.object({ teamId: z.uuid() }),
  query: pointHistoryQuerySchema.query,
}

export const leaderboardSchema = {
  query: z.object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
}
