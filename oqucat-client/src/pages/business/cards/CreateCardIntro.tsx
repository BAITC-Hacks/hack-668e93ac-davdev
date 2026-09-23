import {
  Alert,
  Button,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { generateCard, getCard, reviewCard } from '@/api/http/cards'
import { notify } from '@/context/notification/notify'
import type { CardDetails, ProjectCard } from '@/types/ProjectCard'

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
  const [method, setMethod] =
    useState<ProjectCard['creation_method']>('text_chat')
  const [description, setDescription] = useState('')
  const generate = useMutation({
    mutationFn: async (spoken?: string) => {
      const card = await generateCard(
        spoken ?? description,
        spoken ? 'voice_assistant' : method
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
        component="form"
        variant="outlined"
        sx={{ p: 3, mb: '450px', borderRadius: 3 }}
        onSubmit={(event) => {
          event.preventDefault()
          if (method === 'manual') {
            onManual()
          } else {
            generate.mutate()
          }
        }}
      >
        <Stack
          spacing={2}
          component="fieldset"
          disabled={generate.isPending}
          sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
        >
          <Typography variant="h6">{t('new')}</Typography>
          <TextField
            select
            label={t('method')}
            value={method}
            onChange={(event) => {
              const { value } = event.target
              if (
                value === 'manual' ||
                value === 'text_chat' ||
                value === 'voice_assistant'
              ) {
                setMethod(value)
              }
            }}
          >
            {(['text_chat', 'voice_assistant', 'manual'] as const).map(
              (value) => (
                <MenuItem key={value} value={value}>
                  {t(`methods.${value}`)}
                </MenuItem>
              )
            )}
          </TextField>
          {method !== 'manual' && (
            <>
              <TextField
                label={t('description')}
                placeholder={t('placeholder')}
                multiline
                minRows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
                slotProps={{ htmlInput: { minLength: 10, maxLength: 20_000 } }}
                helperText={t('descriptionHint')}
              />
            </>
          )}
          {generate.isError && (
            <Alert severity="error">{cardError(generate.error)}</Alert>
          )}
          {generate.isPending && <LinearProgress />}
          <Button
            type="submit"
            variant="contained"
            disabled={
              generate.isPending ||
              (method !== 'manual' && description.trim().length < 10)
            }
            sx={{ alignSelf: 'flex-start' }}
          >
            {t(method === 'manual' ? 'openForm' : 'generate')}
          </Button>
        </Stack>
      </Paper>
      <CardAssistant
        question={t('vasya.intro')}
        disabled={generate.isPending}
        busy={generate.isPending}
        onAnswer={async (text) => {
          const combined = `${description} ${text}`.trim().slice(0, 20_000)
          setDescription(combined)
          setMethod('voice_assistant')
          if (combined.length >= 10) {
            await generate.mutateAsync(combined)
          }
        }}
      />
    </>
  )
}
export default CreateCardIntro
