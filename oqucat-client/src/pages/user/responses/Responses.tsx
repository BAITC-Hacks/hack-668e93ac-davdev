import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { MdArrowForward, MdSend } from 'react-icons/md'
import { Link } from 'react-router-dom'

import { getMyApplications } from '@/api/http/marketplace'
import { queryKeys } from '@/api/http/QueryKeys'

const Responses = () => {
  const { t, i18n } = useTranslation('user')
  const { data, isPending, refetch } = useQuery({
    queryKey: queryKeys.myApplications,
    queryFn: async () => (await getMyApplications()) ?? null,
  })
  const dateFormatter = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    dateStyle: 'medium',
  })

  if (isPending) {
    return (
      <Stack sx={{ alignItems: 'center', py: 8 }}>
        <CircularProgress aria-label={t('responses.loading')} />
      </Stack>
    )
  }
  if (!data) {
    return (
      <Alert
        severity="error"
        action={
          <Button onClick={() => void refetch()}>{t('responses.retry')}</Button>
        }
      >
        {t('responses.loadError')}
      </Alert>
    )
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="overline" color="text.secondary">
          {t('responses.eyebrow')}
        </Typography>
        <Typography
          component="h1"
          sx={{ fontSize: { xs: 30, md: 40 }, fontWeight: 700 }}
        >
          {t('responses.title')}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {t('responses.subtitle')}
        </Typography>
      </Box>

      {data.map(({ application, card, team }) => (
        <Paper
          key={application.id}
          variant="outlined"
          sx={{ borderRadius: 3, p: { xs: 3, md: 4 } }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            sx={{ gap: 2, justifyContent: 'space-between' }}
          >
            <Box>
              <Typography variant="overline" color="text.secondary">
                {team?.name ?? t('responses.unknownTeam')}
              </Typography>
              <Typography component="h2" variant="h5" sx={{ fontWeight: 700 }}>
                {card?.title ?? t('responses.unknownTask')}
              </Typography>
            </Box>
            <Box sx={{ textAlign: { sm: 'right' } }}>
              <Chip
                label={t(`responses.status.${application.status}`)}
                color={
                  application.status === 'accepted' ||
                  application.status === 'completed'
                    ? 'success'
                    : 'default'
                }
              />
              <Typography
                variant="caption"
                color="text.secondary"
                component="p"
                sx={{ mt: 1 }}
              >
                {dateFormatter.format(new Date(application.submitted_at))}
              </Typography>
            </Box>
          </Stack>
          <Typography component="h3" sx={{ fontWeight: 700, mt: 3 }}>
            {t('responses.idea')}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {application.materials.idea}
          </Typography>
          <Typography component="h3" sx={{ fontWeight: 700, mt: 2 }}>
            {t('responses.plan')}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {application.materials.plan}
          </Typography>
        </Paper>
      ))}

      {data.length === 0 && (
        <Paper
          variant="outlined"
          sx={{ borderRadius: 3, p: { xs: 3, md: 7 }, textAlign: 'center' }}
        >
          <MdSend size={40} />
          <Typography
            component="h2"
            variant="h5"
            sx={{ fontWeight: 700, mt: 2 }}
          >
            {t('responses.emptyTitle')}
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ maxWidth: 530, mx: 'auto', mt: 2, mb: 3 }}
          >
            {t('responses.emptyDescription')}
          </Typography>
          <Button
            component={Link}
            to="?tab=tasks"
            variant="contained"
            endIcon={<MdArrowForward />}
          >
            {t('responses.explore')}
          </Button>
        </Paper>
      )}
    </Stack>
  )
}

export default Responses
