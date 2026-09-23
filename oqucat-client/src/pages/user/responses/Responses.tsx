import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import LinearProgress from '@mui/material/LinearProgress'
import MuiLink from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MdArrowForward, MdExpandMore, MdSend } from 'react-icons/md'
import { Link, useSearchParams } from 'react-router-dom'

import { getMyApplications, withdrawApplication } from '@/api/http/applications'
import { queryKeys } from '@/api/http/QueryKeys'
import { useAuthSession } from '@/auth/betterAuth'
import type { ApplicationDetails } from '@/types/ProjectApplication'
import { getMarketplaceError, isWebUrl } from '@/utils/getMarketplaceError'

import ApplicationForm from './ApplicationForm'

const Responses = () => {
  const { t, i18n } = useTranslation('user')
  const { data: session } = useAuthSession()
  const userId = session?.user?.id
  const [params] = useSearchParams()
  const client = useQueryClient()
  const [editId, setEditId] = useState<string | null>(null)
  const [withdrawId, setWithdrawId] = useState<string | null>(null)
  const applications = useQuery({
    queryKey: queryKeys.myApplications(userId),
    queryFn: ({ signal }) => getMyApplications(signal),
    enabled: Boolean(userId) && params.get('tab') === 'responses',
    retry: false,
  })
  const edit = applications.data?.find(
    (entry) => entry.application.id === editId
  )
  const withdrawing = applications.data?.find(
    (entry) => entry.application.id === withdrawId
  )
  const canEdit = (entry: ApplicationDetails) =>
    entry.team?.captain_id === userId &&
    ['pending', 'interested'].includes(entry.application.status)
  const canWithdraw = (entry: ApplicationDetails) =>
    entry.team?.captain_id === userId &&
    ['pending', 'interested', 'rejected'].includes(entry.application.status)
  const mutation = useMutation({
    mutationFn: withdrawApplication,
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: queryKeys.marketplace(userId),
      })
      setWithdrawId(null)
    },
  })

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
      {applications.isFetching && (
        <LinearProgress aria-label={t('marketplace.loading')} />
      )}
      {applications.isError && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              onClick={() => {
                void applications.refetch()
              }}
            >
              {t('marketplace.retry')}
            </Button>
          }
        >
          {getMarketplaceError(applications.error)}
        </Alert>
      )}
      {applications.isSuccess && applications.data.length === 0 && (
        <Paper
          variant="outlined"
          sx={{ borderRadius: 3, p: { xs: 3, md: 7 }, textAlign: 'center' }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              p: 3,
              bgcolor: 'action.hover',
              borderRadius: '50%',
              mb: 3,
            }}
          >
            <MdSend size={40} />
          </Box>
          <Typography component="h2" variant="h5" sx={{ fontWeight: 700 }}>
            {t('responses.emptyTitle')}
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ maxWidth: 530, mx: 'auto', mt: 2, mb: 3, lineHeight: 1.8 }}
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
      {applications.isSuccess &&
        applications.data.map((entry) => (
          <Paper
            key={entry.application.id}
            component="article"
            variant="outlined"
            sx={{ p: 3, borderRadius: 3, overflowWrap: 'anywhere' }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{
                justifyContent: 'space-between',
                alignItems: { sm: 'center' },
              }}
            >
              <Typography component="h2" variant="h6">
                {entry.card?.title ?? t('responses.cardUnavailable')}
              </Typography>
              <Chip
                label={t(`applicationStatus.${entry.application.status}`)}
              />
            </Stack>
            <Typography color="text.secondary" sx={{ my: 1 }}>
              {entry.team?.name ?? t('marketplace.notSpecified')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {new Intl.DateTimeFormat(i18n.resolvedLanguage, {
                dateStyle: 'medium',
              }).format(new Date(entry.application.submitted_at))}
            </Typography>
            <Accordion
              disableGutters
              elevation={0}
              sx={{
                my: 2,
                bgcolor: 'transparent',
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary expandIcon={<MdExpandMore />}>
                <Typography>{t('responses.materials')}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                    <strong>{t('responses.idea')}</strong>
                    {'\n'}
                    {entry.application.materials.idea}
                  </Typography>
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                    <strong>{t('responses.plan')}</strong>
                    {'\n'}
                    {entry.application.materials.plan}
                  </Typography>
                  {isWebUrl(entry.application.materials.prototype_url) ? (
                    <MuiLink
                      href={entry.application.materials.prototype_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t('responses.prototype')}
                    </MuiLink>
                  ) : (
                    <Typography>
                      {entry.application.materials.prototype_url}
                    </Typography>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>
            {entry.decision?.comment && (
              <Alert severity="info" sx={{ my: 2, whiteSpace: 'pre-wrap' }}>
                {entry.decision.comment}
              </Alert>
            )}
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{ flexWrap: 'wrap' }}
            >
              {entry.card && (
                <Button
                  component={Link}
                  to={`?tab=tasks&task=${entry.card.id}`}
                >
                  {t('tasks.details')}
                </Button>
              )}
              {canEdit(entry) && (
                <Button onClick={() => setEditId(entry.application.id)}>
                  {t('responses.edit')}
                </Button>
              )}
              {canWithdraw(entry) && (
                <Button
                  color="error"
                  onClick={() => {
                    mutation.reset()
                    setWithdrawId(entry.application.id)
                  }}
                >
                  {t('responses.withdraw')}
                </Button>
              )}
            </Stack>
          </Paper>
        ))}
      <Paper variant="outlined" sx={{ borderRadius: 3, p: 3 }}>
        <Typography component="h2" variant="h6">
          {t('responses.processTitle')}
        </Typography>
        <Box
          component="ol"
          sx={{ pl: 2.5, color: 'text.secondary', '& li': { py: 1 } }}
        >
          {['idea', 'review', 'result'].map((step) => (
            <li key={step}>{t(`responses.steps.${step}`)}</li>
          ))}
        </Box>
      </Paper>
      {edit?.team && canEdit(edit) && (
        <ApplicationForm
          key={edit.application.id}
          cardId={edit.application.card_id}
          teams={[edit.team]}
          initial={edit}
          onClose={() => setEditId(null)}
          onSaved={() => setEditId(null)}
        />
      )}
      <Dialog
        open={Boolean(withdrawing)}
        onClose={() => {
          if (!mutation.isPending) {
            setWithdrawId(null)
          }
        }}
        aria-labelledby="withdraw-title"
      >
        <DialogTitle id="withdraw-title">{t('responses.withdraw')}</DialogTitle>
        <DialogContent>
          <Typography>{t('responses.withdrawConfirm')}</Typography>
          {mutation.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {getMarketplaceError(mutation.error)}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setWithdrawId(null)}
            disabled={mutation.isPending}
          >
            {t('common:actions.cancel')}
          </Button>
          <Button
            color="error"
            disabled={
              !withdrawing || !canWithdraw(withdrawing) || mutation.isPending
            }
            loading={mutation.isPending}
            onClick={() => {
              if (withdrawing) {
                mutation.mutate(withdrawing.application.id)
              }
            }}
          >
            {t('marketplace.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

export default Responses
