import type {
  ApplicationDetails,
  MarketplaceTag,
  MyTeams,
  ProjectCardCatalog,
  StudentLeaderboardEntry,
  TeamDetails,
  TeamLeaderboardEntry,
  TeamMembership,
} from '@/types/Marketplace'

import { apiRequest, host } from '.'

export const getProjectCards = (tagId?: string) =>
  apiRequest<ProjectCardCatalog>(
    host.get('cards/catalog', {
      params: { limit: 100, ...(tagId ? { tag_id: tagId } : {}) },
    })
  )

export const getMarketplaceTags = () =>
  apiRequest<MarketplaceTag[]>(host.get('tags'))

export const getMyTeamMemberships = () =>
  apiRequest<TeamMembership[]>(host.get('teams/mine'))

export const getTeam = (teamId: string) =>
  apiRequest<TeamDetails>(host.get(`teams/${teamId}`))

export const getMyTeams = async (): Promise<MyTeams | undefined> => {
  const memberships = await getMyTeamMemberships()

  if (!memberships) {
    return undefined
  }

  const details = await Promise.all(
    memberships.map(({ team_id: teamId }) => getTeam(teamId))
  )

  return {
    memberships,
    details: details.filter((team): team is TeamDetails => Boolean(team)),
  }
}

export const getMyApplications = () =>
  apiRequest<ApplicationDetails[]>(host.get('applications/mine'))

export const getStudentLeaderboard = () =>
  apiRequest<StudentLeaderboardEntry[]>(host.get('leaderboards/students'))

export const getTeamLeaderboard = () =>
  apiRequest<TeamLeaderboardEntry[]>(host.get('leaderboards/teams'))
