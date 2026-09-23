import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import LinearProgress from '@mui/material/LinearProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MdArrowBack, MdArrowForward, MdGroups } from 'react-icons/md'
import { Link, useSearchParams } from 'react-router-dom'

import { getMyApplications } from '@/api/http/applications'
import { getCard } from '@/api/http/cards'
import { queryKeys } from '@/api/http/QueryKeys'
import { getMyTeams } from '@/api/http/teams'
import { useAuthSession } from '@/auth/betterAuth'
import ApplicationForm from '@/pages/user/responses/ApplicationForm'
import type { JsonValue } from '@/types/ProjectCard'
import type { MyMembership } from '@/types/Team'
import { getMarketplaceError } from '@/utils/getMarketplaceError'

const fields = [
  { label: 'context', key: 'context' },
  { label: 'need', key: 'need' },
  { label: 'users', key: 'target_users' },
  { label: 'data', key: 'data' },
  { label: 'constraints', key: 'constraints' },
  { label: 'result', key: 'expected_result' },
  { label: 'success', key: 'success_criteria' },
  { label: 'contact', key: 'contact' },
  { label: 'interaction', key: 'interaction_format' },
] as const

const displayValue = (value: JsonValue, fallback: string) => {
  if (value === null || value === '') {
    return fallback
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }
  return String(value)
}

const getCaptainTeams = (members: MyMembership[], userId: string | undefined) =>
  members.flatMap((member) =>
    member.status === 'accepted' &&
    member.team &&
    member.team.captain_id === userId
      ? [member.team]
      : []
  )

const unavailableReason = (published: boolean, hasCaptainTeam: boolean) => {
  if (!published) {
    return 'tasks.closed'
  }
  return hasCaptainTeam ? 'tasks.alreadyApplied' : 'tasks.captainOnly'
}

const TaskDetails = ({ taskId }: { taskId: string }) => {
  const { t } = useTranslation('user')
  const { data: session } = useAuthSession()
  const userId = session?.user?.id
  const [, setParams] = useSearchParams()
  const [applying, setApplying] = useState(false)
  const task = useQuery({
    queryKey: queryKeys.card(userId, taskId),
    queryFn: ({ signal }) => getCard(taskId, signal),
    enabled: Boolean(userId),
    retry: false,
  })
  const teams = useQuery({
    queryKey: queryKeys.myTeams(userId),
    queryFn: ({ signal }) => getMyTeams(signal),
    enabled: Boolean(userId),
    retry: false,
  })
  const applications = useQuery({
    queryKey: queryKeys.myApplications(userId),
    queryFn: ({ signal }) => getMyApplications(signal),
    enabled: Boolean(userId),
    retry: false,
  })
  const captainTeams = getCaptainTeams(teams.data ?? [], userId)
  const availableTeams = captainTeams.filter(
    (team) =>
      !applications.data?.some(
        (entry) =>
          entry.application.team_id === team.id &&
          entry.application.card_id === taskId
      )
  )
  const prerequisitesReady = teams.isSuccess && applications.isSuccess
  const canApply = [
    prerequisitesReady,
    task.data?.card.status === 'published',
    availableTeams.length > 0,
  ].every(Boolean)
  const prerequisiteError = teams.error ?? applications.error

  return (
    <Stack spacing={3}>
      <Button
        component={Link}
        to="?tab=tasks"
        startIcon={<MdArrowBack />}
        color="inherit"
        sx={{ alignSelf: 'flex-start' }}
      >
        {t('tasks.back')}
      </Button>
      {task.isFetching && (
        <LinearProgress aria-label={t('marketplace.loading')} />
      )}
      {task.isError && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              onClick={() => {
                void task.refetch()
              }}
            >
              {t('marketplace.retry')}
            </Button>
          }
        >
          {getMarketplaceError(task.error)}
        </Alert>
      )}
      {task.isSuccess && (
        <>
          <Box sx={{ overflowWrap: 'anywhere' }}>
            <Typography variant="overline" color="text.secondary">
              {task.data.company?.name ?? t('marketplace.notSpecified')}
            </Typography>
            <Typography
              variant="h3"
              component="h1"
              sx={{ fontSize: { xs: 28, md: 40 }, fontWeight: 700, mt: 1 }}
            >
              {task.data.card.title}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1.5 }}>
              {t(`cardStatus.${task.data.card.status}`)}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 290px' },
              gap: 3,
              alignItems: 'start',
            }}
          >
            <Paper
              variant="outlined"
              sx={{ borderRadius: 3, p: { xs: 2.5, md: 4 }, minWidth: 0 }}
            >
              <Stack spacing={3} divider={<Divider />}>
                {fields.map((field) => (
                  <Box key={field.key}>
                    <Typography
                      component="h2"
                      sx={{ fontSize: 18, fontWeight: 700, mb: 1 }}
                    >
                      {t(`tasks.fields.${field.label}`)}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      sx={{
                        lineHeight: 1.8,
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {task.data.card[field.key] ||
                        t('marketplace.notSpecified')}
                    </Typography>
                  </Box>
                ))}
                {task.data.fields.map((field) => (
                  <Box key={field.id}>
                    <Typography
                      component="h2"
                      sx={{
                        fontSize: 18,
                        fontWeight: 700,
                        mb: 1,
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {field.label}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
                    >
                      {typeof field.value === 'boolean'
                        ? t(field.value ? 'marketplace.yes' : 'marketplace.no')
                        : displayValue(
                            field.value,
                            t('marketplace.notSpecified')
                          )}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
            <Paper variant="outlined" sx={{ borderRadius: 3, p: 3 }}>
              <Typography variant="overline" color="text.secondary">
                {t('tasks.reward')}
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 32 }}>
                {t('tasks.points', { count: task.data.card.reward_points })}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {t('tasks.completeness', {
                  value: task.data.card.completeness_score,
                })}
              </Typography>
              <Divider sx={{ my: 3 }} />
              <MdGroups size={28} />
              <Typography sx={{ fontWeight: 700, my: 1 }}>
                {t('tasks.teamOnly')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('tasks.teamRule')}
              </Typography>
              {(teams.isPending || applications.isPending) && (
                <LinearProgress
                  sx={{ my: 2 }}
                  aria-label={t('marketplace.loading')}
                />
              )}
              {prerequisiteError && (
                <Alert
                  severity="error"
                  sx={{ mt: 2 }}
                  action={
                    <Button
                      color="inherit"
                      onClick={() => {
                        void teams.refetch()
                        void applications.refetch()
                      }}
                    >
                      {t('marketplace.retry')}
                    </Button>
                  }
                >
                  {getMarketplaceError(prerequisiteError)}
                </Alert>
              )}
              {prerequisitesReady && !canApply && (
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                  {t(
                    unavailableReason(
                      task.data.card.status === 'published',
                      captainTeams.length > 0
                    )
                  )}
                </Typography>
              )}
              <Button
                fullWidth
                variant="contained"
                disabled={!canApply}
                sx={{ mt: 3 }}
                onClick={() => setApplying(true)}
              >
                {t('tasks.apply')}
              </Button>
              <Button
                component={Link}
                to="?tab=team"
                endIcon={<MdArrowForward />}
                sx={{ mt: 2 }}
              >
                {t('navigation.openTeam')}
              </Button>
              <Button component={Link} to="?tab=responses">
                {t('responses.title')}
              </Button>
            </Paper>
          </Box>
          {applying && canApply && (
            <ApplicationForm
              cardId={taskId}
              teams={availableTeams}
              onClose={() => setApplying(false)}
              onSaved={() => {
                setApplying(false)
                setParams({ tab: 'responses' })
              }}
            />
          )}
        </>
      )}
    </Stack>
  )
}

export default TaskDetails
