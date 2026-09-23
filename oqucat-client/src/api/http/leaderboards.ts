import type { StudentRank, TeamRank } from '@/types/Leaderboard'

import { host } from '.'

export const getStudentLeaderboard = async (signal?: AbortSignal) => {
  const { data } = await host.get<StudentRank[]>('leaderboards/students', {
    params: { limit: 100 },
    signal,
  })
  return data
}

export const getTeamLeaderboard = async (signal?: AbortSignal) => {
  const { data } = await host.get<TeamRank[]>('leaderboards/teams', {
    params: { limit: 100 },
    signal,
  })
  return data
}
