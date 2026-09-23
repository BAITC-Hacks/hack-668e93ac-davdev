import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { CardDetails } from '@/types/ProjectCard'

import CardAssistant from './CardAssistant'
import CardClarifications from './CardClarifications'
import CardEditorForm from './CardEditorForm'
import { cardError } from './cardError'
import CardRating from './CardRating'
import PublicationDialog from './PublicationDialog'
import useCardEditor from './useCardEditor'

const CardEditor = ({
  initial,
  onBack,
  onCreated,
}: {
  initial?: CardDetails
  onBack: () => void
  onCreated: (card: CardDetails) => void
}) => {
  const { t } = useTranslation(['business', 'user'])
  const editor = useCardEditor(initial, onCreated)
  const { saved, busy, dirty, error, notice, blocker, reviews } = editor
  const status = saved?.card.status ?? 'draft'
  const editable = ['draft', 'published'].includes(status)
  const score = saved ? saved.card.completeness_score : 0
  const reward = saved ? saved.card.reward_points : 0
  return (
    <Stack spacing={3} sx={{ pb: { xs: '430px', md: '460px' } }}>
      <Button sx={{ alignSelf: 'flex-start' }} disabled={busy} onClick={onBack}>
        {t('back')}
      </Button>
      <Typography component="h1" variant="h4">
        {editor.input.title || t('new')}
      </Typography>
      <Typography color="text.secondary">
        {t(`user:cardStatus.${status}`)}
      </Typography>
      {busy && <LinearProgress aria-label={t('working')} />}
      {error && <Alert severity="error">{error}</Alert>}
      {notice && (
        <Alert severity="success" role="status">
          {notice}
        </Alert>
      )}
      {!editable && <Alert severity="info">{t('readOnly')}</Alert>}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 2fr) minmax(280px, 1fr)',
          },
          gap: 3,
          alignItems: 'start',
        }}
      >
        <Stack spacing={3}>
          <CardEditorForm editor={editor} editable={editable} />
          {saved && status === 'draft' && (
            <CardClarifications
              cardId={saved.card.id}
              disabled={busy}
              onPrepare={editor.prepareAnswers}
              onBusy={editor.setBusy}
              onDirty={editor.setAnswersDirty}
              onApplied={editor.applied}
            />
          )}
        </Stack>
        <Stack spacing={2}>
          <CardRating
            review={editor.currentReview}
            score={score}
            reward={reward}
            stale={dirty || !editor.currentReview}
          />
          {reviews.isError && (
            <Alert
              severity="warning"
              action={
                <Button
                  onClick={() => {
                    void reviews.refetch()
                  }}
                >
                  {t('retry')}
                </Button>
              }
            >
              {cardError(reviews.error)}
            </Alert>
          )}
          {saved && status === 'draft' && <PublicationDialog editor={editor} />}
        </Stack>
      </Box>
      {!saved && (
        <CardAssistant
          question={t('vasya.manual')}
          disabled={busy}
          busy={busy}
          onAnswer={(text) =>
            editor.setInput((current) => ({
              ...current,
              context: `${current.context ?? ''} ${text}`
                .trim()
                .slice(0, 10_000),
            }))
          }
        />
      )}
      <Dialog
        open={blocker.state === 'blocked'}
        onClose={() => blocker.reset?.()}
      >
        <DialogTitle>{t('leave.title')}</DialogTitle>
        <DialogContent>{t('leave.description')}</DialogContent>
        <DialogActions>
          <Button onClick={() => blocker.reset?.()}>{t('cancel')}</Button>
          <Button
            color="error"
            disabled={busy}
            onClick={() => blocker.proceed?.()}
          >
            {t('leave.discard')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
export default CardEditor
