import {
  Alert,
  Button,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { generateCard, getCard, reviewCard } from '@/api/http/cards'
import { notify } from '@/context/notification/notify'
import type { CardDetails } from '@/types/ProjectCard'

import CardAssistant from './CardAssistant'
import { cardError } from './cardError'

const CreateCardIntro = ({
  onCreated,
  onManual,
}: {
  onCreated: (card: CardDetails) => void
  onManual: () => void
}) => {
  const { t } = useTranslation('business')
  const generate = useMutation({
    mutationFn: async (spoken: string) => {
      const card = await generateCard(
        spoken.trim().slice(0, 20_000),
        'voice_assistant'
      )
      try {
        await reviewCard(card.card.id)
        return await getCard(card.card.id)
      } catch (error) {
        // Creation succeeded: keep the draft addressable if evaluation fails.
        notify.error(cardError(error))
        return card
      }
    },
    onSuccess: onCreated,
  })
  return (
    <>
      <Paper
        variant="outlined"
        sx={{ p: 3, mb: '450px', borderRadius: 3 }}
      >
        <Stack
          spacing={2}
          component="fieldset"
          disabled={generate.isPending}
          sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
        >
          <Typography variant="h6">{t('new')}</Typography>
          <Typography color="text.secondary">{t('vasya.intro')}</Typography>
          {generate.isError && (
            <Alert severity="error">{cardError(generate.error)}</Alert>
          )}
          {generate.isPending && <LinearProgress />}
          <Button
            type="button"
            variant="outlined"
            disabled={generate.isPending}
            onClick={onManual}
            sx={{ alignSelf: 'flex-start' }}
          >
            {t('methods.manual')}
          </Button>
        </Stack>
      </Paper>
      <CardAssistant
        question={t('vasya.intro')}
        disabled={generate.isPending}
        busy={generate.isPending}
        onAnswer={async (text) => {
          await generate.mutateAsync(text)
        }}
      />
    </>
  )
}
export default CreateCardIntro
