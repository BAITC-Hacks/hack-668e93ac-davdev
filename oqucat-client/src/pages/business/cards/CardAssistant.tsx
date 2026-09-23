import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { lazy, Suspense, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MdExpandLess, MdExpandMore, MdVolumeUp } from 'react-icons/md'

import useCardQuestionVoice from './useCardQuestionVoice'
import VoiceInput from './VoiceInput'

const CardVasyaAvatar = lazy(() => import('./CardVasyaAvatar'))
const CardAssistant = ({
  cardId,
  questionId,
  question,
  disabled,
  busy,
  onAnswer,
}: {
  cardId?: string
  questionId?: string
  question: string
  disabled: boolean
  busy: boolean
  onAnswer: (answer: string) => void | Promise<void>
}) => {
  const { t } = useTranslation('business')
  const [collapsed, setCollapsed] = useState(false)
  const [phase, setPhase] = useState<
    'idle' | 'starting' | 'recording' | 'processing'
  >('idle')
  const microphone = useRef<{ toggle: () => void }>(null)
  const voice = useCardQuestionVoice(cardId, questionId)
  const activity =
    phase === 'recording' || phase === 'starting'
      ? 'listening'
      : phase === 'processing' || busy || voice.loading
        ? 'thinking'
        : voice.playing
          ? 'talking'
          : 'idle'
  return (
    <Paper
      component="aside"
      aria-label={t('vasya.title')}
      elevation={8}
      sx={{
        position: 'fixed',
        right: { xs: 12, md: 24 },
        bottom: 'max(12px, var(--safe-bottom))',
        zIndex: 1200,
        width: { xs: 'min(310px, calc(100vw - 24px))', md: 320 },
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <Stack
        direction="row"
        sx={{
          px: 2,
          py: 1,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography sx={{ fontSize: 16 }}>{t('vasya.title')}</Typography>
        <IconButton
          disabled={phase !== 'idle' || busy}
          aria-label={t(collapsed ? 'vasya.expand' : 'vasya.collapse')}
          aria-expanded={!collapsed}
          onClick={() => {
            if (!collapsed) {
              voice.pause()
            }
            setCollapsed(!collapsed)
          }}
        >
          {collapsed ? <MdExpandLess /> : <MdExpandMore />}
        </IconButton>
      </Stack>
      <Box sx={{ display: collapsed ? 'none' : 'block' }}>
        <Box sx={{ height: { xs: 160, md: 210 } }}>
          <Suspense fallback={<CircularProgress size={24} />}>
            <CardVasyaAvatar
              activity={activity}
              onActivate={() => microphone.current?.toggle()}
            />
          </Suspense>
        </Box>
        <Stack spacing={1} sx={{ p: 2, pt: 0 }}>
          <Typography
            variant="body2"
            sx={{ maxHeight: 110, overflowY: 'auto' }}
            aria-live="polite"
          >
            {question}
          </Typography>
          {cardId && (
            <Button
              size="small"
              disabled={
                !questionId || busy || voice.loading || phase !== 'idle'
              }
              startIcon={<MdVolumeUp />}
              onClick={() => {
                void voice.speak()
              }}
            >
              {t('vasya.speak')}
            </Button>
          )}
          {voice.failed && (
            <Alert severity="warning">{t('vasya.voiceFailed')}</Alert>
          )}
          <VoiceInput
            ref={microphone}
            disabled={disabled}
            onStart={voice.listen}
            onPhase={setPhase}
            onText={onAnswer}
          />
          <Typography variant="caption" color="text.secondary">
            {t('vasya.autoApply')}
          </Typography>
        </Stack>
      </Box>
    </Paper>
  )
}
export default CardAssistant
