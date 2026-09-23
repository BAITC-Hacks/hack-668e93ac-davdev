import { z } from 'zod'

import { TeamMemberStatus } from '../../types/TeamMemberStatus'
import { zodUserID } from '../../types/UserId'

const teamFields = z.object({
  name: z.string().trim().min(2).max(120),
  logo: z.union([z.url(), z.literal(''), z.null()]).optional(),
})

export const createTeamSchema = { body: teamFields }
export const updateTeamSchema = { body: teamFields.partial() }

export const teamParamsSchema = {
  params: z.object({ teamId: z.uuid() }),
}

export const inviteTeamMemberSchema = {
  params: teamParamsSchema.params,
  body: z.object({ user_id: zodUserID }),
}

export const respondToInvitationSchema = {
  params: teamParamsSchema.params,
  body: z.object({
    status: z.enum([TeamMemberStatus.ACCEPTED, TeamMemberStatus.DECLINED]),
  }),
}

export const removeTeamMemberSchema = {
  params: z.object({
    teamId: z.uuid(),
    userId: zodUserID,
  }),
}
