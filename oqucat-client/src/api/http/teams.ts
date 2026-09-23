import type {
  MyMembership,
  TeamDetails,
  TeamInput,
  TeamMember,
} from '@/types/Team'

import { host } from '.'

export const getMyTeams = async (signal?: AbortSignal) => {
  const { data } = await host.get<MyMembership[]>('teams/mine', { signal })
  return data
}

export const getTeam = async (id: string, signal?: AbortSignal) => {
  const { data } = await host.get<TeamDetails>(
    `teams/${encodeURIComponent(id)}`,
    { signal }
  )
  return data
}

export const createTeam = async (input: TeamInput) => {
  const memberships = await getMyTeams()
  if (memberships.some((member) => member.status === 'accepted')) {
    throw new Error('already_in_team')
  }
  const { data } = await host.post<TeamDetails>('teams', input)
  return data
}

export const updateTeam = async (id: string, input: TeamInput) => {
  const { data } = await host.patch<TeamDetails>(
    `teams/${encodeURIComponent(id)}`,
    input
  )
  return data
}

export const inviteTeamMember = async (id: string, userId: string) => {
  const { data } = await host.post<TeamMember>(
    `teams/${encodeURIComponent(id)}/invitations`,
    { user_id: userId }
  )
  return data
}

export const respondToInvitation = async (
  id: string,
  status: 'accepted' | 'declined'
) => {
  if (status === 'accepted') {
    const memberships = await getMyTeams()
    if (memberships.some((member) => member.status === 'accepted')) {
      throw new Error('already_in_team')
    }
  }
  const { data } = await host.patch<TeamMember>(
    `teams/${encodeURIComponent(id)}/invitations/me`,
    { status }
  )
  return data
}

export const removeTeamMember = async (id: string, userId: string) => {
  await host.delete(
    `teams/${encodeURIComponent(id)}/members/${encodeURIComponent(userId)}`
  )
}
