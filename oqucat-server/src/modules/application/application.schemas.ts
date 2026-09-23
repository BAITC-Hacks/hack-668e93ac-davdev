import { z } from 'zod'

import { ApplicationDecisionStatus } from '../../types/ApplicationDecisionStatus'

export const createApplicationSchema = {
  body: z.object({
    card_id: z.uuid(),
    team_id: z.uuid(),
    materials: z.object({
      idea: z.string().trim().min(1).max(10_000),
      plan: z.string().trim().min(1).max(10_000),
      prototype_url: z.url(),
    }),
  }),
}

export const updateApplicationSchema = {
  params: z.object({ applicationId: z.uuid() }),
  body: createApplicationSchema.body
    .omit({ card_id: true, team_id: true })
    .partial(),
}

export const applicationParamsSchema = {
  params: z.object({ applicationId: z.uuid() }),
}

export const cardApplicationsParamsSchema = {
  params: z.object({ cardId: z.uuid() }),
}

export const decideApplicationSchema = {
  params: applicationParamsSchema.params,
  body: z.object({
    status: z.enum(ApplicationDecisionStatus),
    comment: z.string().trim().max(5000).nullish(),
  }),
}
