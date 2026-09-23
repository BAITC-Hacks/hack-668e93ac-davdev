import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { MdArrowForward, MdGroups } from 'react-icons/md'
import { Link } from 'react-router-dom'

import { getMyTeams } from '@/api/http/marketplace'
import { queryKeys } from '@/api/http/QueryKeys'
import { getAvatar, getLogo } from '@/utils/getAvatar'

const Team = () => {
  const { t } = useTranslation('user')
  const { data, isPending, refetch } = useQuery({
    queryKey: queryKeys.myTeamMemberships,
    queryFn: async () => (await getMyTeams()) ?? null,
  })

  if (isPending) {
    return (
      <Stack sx={{ alignItems: 'center', py: 8 }}>
        <CircularProgress aria-label={t('team.loading')} />
      </Stack>
    )
  }
  if (!data) {
    return (
      <Alert
        severity="error"
        action={
          <Button onClick={() => void refetch()}>{t('team.retry')}</Button>
        }
      >
        {t('team.loadError')}
      </Alert>
    )
  }

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

      {data.details.map(
        ({ team, captain, members, rating, reviews_count: reviewsCount }) => {
          const membership = data.memberships.find(
            ({ team_id: teamId }) => teamId === team.id
          )

          return (
            <Paper
              key={team.id}
              variant="outlined"
              sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={3}
                sx={{ alignItems: { sm: 'center' } }}
              >
                <Avatar
                  src={getLogo(team.logo ?? undefined)}
                  sx={{ width: 72, height: 72 }}
                >
                  <MdGroups />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Stack
                    direction="row"
                    sx={{ gap: 1, alignItems: 'center', flexWrap: 'wrap' }}
                  >
                    <Typography
                      component="h2"
                      variant="h5"
                      sx={{ fontWeight: 700 }}
                    >
                      {team.name}
                    </Typography>
                    {membership && (
                      <Chip
                        size="small"
                        label={t(`team.status.${membership.status}`)}
                      />
                    )}
                  </Stack>
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    {t('team.points', { count: team.points_balance })}
                    {' · '}
                    {t('team.rating', {
                      value: rating?.toFixed(1) ?? '—',
                      count: reviewsCount,
                    })}
                  </Typography>
                </Box>
              </Stack>

              <Typography component="h3" sx={{ fontWeight: 700, mt: 4, mb: 2 }}>
                {t('team.members', { count: members.length })}
              </Typography>
              <Stack direction="row" sx={{ gap: 2, flexWrap: 'wrap' }}>
                {members.map(({ membership: member }) => (
                  <Stack
                    key={member.user_id}
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                  >
                    <Avatar
                      src={getAvatar(member.user?.image)}
                      sx={{ width: 36, height: 36 }}
                    />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {member.user?.name ?? t('team.unknownMember')}
                      </Typography>
                      {member.user_id === captain?.id && (
                        <Typography variant="caption" color="text.secondary">
                          {t('team.captain')}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          )
        }
      )}

      {data.details.length === 0 && (
        <Paper
          variant="outlined"
          sx={{ p: { xs: 3, md: 6 }, borderRadius: 3, textAlign: 'center' }}
        >
          <MdGroups size={48} />
          <Typography
            component="h2"
            variant="h5"
            sx={{ fontWeight: 700, mt: 2 }}
          >
            {t('team.emptyTitle')}
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ maxWidth: 520, mx: 'auto', mt: 2, mb: 3 }}
          >
            {t('team.emptyDescription')}
          </Typography>
          <Button component={Link} to="?tab=tasks" endIcon={<MdArrowForward />}>
            {t('team.explore')}
          </Button>
        </Paper>
      )}
    </Stack>
  )
}

export default Team
