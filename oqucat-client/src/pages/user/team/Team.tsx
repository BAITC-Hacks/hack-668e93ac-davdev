import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MdGroups, MdPerson, MdVerifiedUser } from 'react-icons/md'
import { useSearchParams } from 'react-router-dom'

import { queryKeys } from '@/api/http/QueryKeys'
import { createStudentProfile, getMyStudentProfile } from '@/api/http/students'
import { getMyTeams, getTeam } from '@/api/http/teams'
import { useAuthSession } from '@/auth/betterAuth'
import { getMarketplaceError } from '@/utils/getMarketplaceError'

import TeamContent from './TeamContent'

const rules = [
  { id: 'captain', icon: MdVerifiedUser },
  { id: 'solo', icon: MdPerson },
  { id: 'oneTeam', icon: MdGroups },
] as const

const useTeamState = () => {
  const { data: session } = useAuthSession()
  const userId = session?.user?.id
  const [params] = useSearchParams()
  const active = params.get('tab') === 'team'
  const client = useQueryClient()
  const [selectedId, setSelectedId] = useState('')
  const [editing, setEditing] = useState(false)
  const memberships = useQuery({
    queryKey: queryKeys.myTeams(userId),
    queryFn: ({ signal }) => getMyTeams(signal),
    enabled: Boolean(userId) && active,
    retry: false,
  })
  const profile = useQuery({
    queryKey: queryKeys.studentProfile(userId),
    queryFn: ({ signal }) => getMyStudentProfile(signal),
    enabled: Boolean(userId) && active,
    retry: false,
  })
  const joined = (memberships.data ?? []).filter(
    (member) => member.status === 'accepted' && member.team
  )
  const teamId = joined.some((member) => member.team_id === selectedId)
    ? selectedId
    : joined.length === 1
      ? joined[0].team_id
      : ''
  const details = useQuery({
    queryKey: queryKeys.team(userId, teamId),
    queryFn: ({ signal }) => getTeam(teamId, signal),
    enabled: Boolean(userId && teamId) && active && memberships.isSuccess,
    retry: false,
  })
  const initialize = useMutation({
    mutationFn: createStudentProfile,
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: queryKeys.marketplace(userId),
      })
    },
  })
  const error = memberships.error ?? profile.error
  const ready = memberships.isSuccess && profile.isSuccess
  const team = details.isSuccess ? details.data.team : undefined
  const captain = team?.captain_id === userId

  return {
    userId,
    memberships,
    profile,
    error,
    ready,
    teamId,
    joined,
    details,
    initialize,
    captain,
    team,
    editing,
    setEditing,
    setSelectedId,
  }
}

type TeamState = ReturnType<typeof useTeamState>

const Team = () => {
  const { t } = useTranslation('user')
  const state = useTeamState()
  const { memberships, profile, error, ready } = state

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="overline" color="text.secondary">
          {t('team.eyebrow')}
        </Typography>
        <Typography
          component="h1"
          sx={{ fontSize: { xs: 30, md: 40 }, fontWeight: 700 }}
        >
          {t('team.title')}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {t('team.subtitle')}
        </Typography>
      </Box>
      {(memberships.isFetching || profile.isFetching) && (
        <LinearProgress aria-label={t('marketplace.loading')} />
      )}
      {error && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              onClick={() => {
                void memberships.refetch()
                void profile.refetch()
              }}
            >
              {t('marketplace.retry')}
            </Button>
          }
        >
          {getMarketplaceError(error)}
        </Alert>
      )}
      {ready && <TeamContent state={state} />}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
          gap: 2,
        }}
      >
        {rules.map((rule) => (
          <Box key={rule.id} sx={{ p: 2.5 }}>
            <rule.icon size={26} />
            <Typography component="h2" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
              {t(`team.rules.${rule.id}.title`)}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {t(`team.rules.${rule.id}.description`)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Stack>
  )
}

export default Team
export type { TeamState }
