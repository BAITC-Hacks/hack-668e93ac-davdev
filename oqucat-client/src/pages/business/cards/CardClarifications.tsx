import {
  Alert,
  Button,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'

import CardAssistant from './CardAssistant'
import { cardError } from './cardError'
import useCardClarifications, {
  type ClarificationProps,
} from './useCardClarifications'

const CardClarifications = (props: ClarificationProps) => {
  const { t } = useTranslation('business')
  const state = useCardClarifications(props)
  const { questions, answers, busy, requestError, active } = state
  const disabled = props.disabled || busy
  return (
    <>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6">{t('questions.title')}</Typography>
          <Typography color="text.secondary">
            {t('questions.automatic')}
          </Typography>
          {(questions.isFetching || busy) && (
            <LinearProgress aria-label={t('working')} />
          )}
          {(requestError ?? questions.isError) && (
            <Alert
              severity="error"
              action={
                <Button
                  disabled={busy}
                  onClick={() => {
                    if (questions.isError) {
                      void questions.refetch()
                    } else {
                      void state.retryApply()
                    }
                  }}
                >
                  {t('retry')}
                </Button>
              }
            >
              {requestError ?? cardError(questions.error)}
            </Alert>
          )}
          <Stack
            component="fieldset"
            disabled={disabled}
            sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
            spacing={2}
          >
            {questions.data?.map((question) => (
              <TextField
                key={question.id}
                fullWidth
                multiline
                minRows={2}
                label={question.question}
                value={answers[question.id] ?? question.answer ?? ''}
                slotProps={{ htmlInput: { maxLength: 10_000 } }}
                onFocus={() => state.setActiveId(question.id)}
                onChange={(event) =>
                  state.setAnswers({
                    ...answers,
                    [question.id]: event.target.value,
                  })
                }
                onBlur={(event) => {
                  void state.commit(question.id, event.target.value)
                }}
              />
            ))}
            <Button
              disabled={
                disabled ||
                questions.isFetching ||
                questions.data?.some(
                  (question) =>
                    !question.answer?.trim() ||
                    (answers[question.id] !== undefined &&
                      answers[question.id]?.trim() !== question.answer.trim())
                )
              }
              onClick={() => {
                void state.more()
              }}
            >
              {t('questions.more')}
            </Button>
          </Stack>
        </Stack>
      </Paper>
      <CardAssistant
        cardId={props.cardId}
        questionId={active?.id}
        question={active?.question ?? t('vasya.complete')}
        disabled={disabled || !active}
        busy={busy}
        onAnswer={state.voiceAnswer}
      />
    </>
  )
}
export default CardClarifications
