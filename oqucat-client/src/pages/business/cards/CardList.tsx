import {
  Alert,
  Box,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { getMyCards } from '@/api/http/cards'
import { queryKeys } from '@/api/http/QueryKeys'
import type { CardDetails } from '@/types/ProjectCard'

import { cardError } from './cardError'
import { readiness } from './cardForm'

const CardList = ({
  onOpen,
  userId,
}: {
  onOpen: (card: CardDetails) => void
  userId: string | undefined
}) => {
  const { t } = useTranslation(['business', 'user'])
  const cards = useQuery({
    queryKey: [...queryKeys.marketplace(userId), 'mine'],
    queryFn: ({ signal }) => getMyCards(signal),
    enabled: Boolean(userId),
    retry: false,
  })
  return (
    <>
      <Typography variant="h5" component="h2">
        {t('mine')}
      </Typography>
      {cards.isFetching && <LinearProgress />}
      {cards.isError && (
        <Alert
          severity="error"
          action={
            <Button
              onClick={() => {
                void cards.refetch()
              }}
            >
              {t('retry')}
            </Button>
          }
        >
          {cardError(cards.error)}
        </Alert>
      )}
      {cards.data?.length === 0 && <Alert severity="info">{t('empty')}</Alert>}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, minmax(0, 1fr))',
            xl: 'repeat(3, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        {cards.data?.map((details) => (
          <Paper
            key={details.card.id}
            variant="outlined"
            sx={{ p: 3, borderRadius: 3, overflowWrap: 'anywhere' }}
          >
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={t(`user:cardStatus.${details.card.status}`)}
                />
                <Chip
                  size="small"
                  variant="outlined"
                  label={t(
                    `readiness.${readiness(details.card.completeness_score)}`
                  )}
                />
              </Stack>
              <Typography variant="h6">{details.card.title}</Typography>
              <Typography color="text.secondary">{`${details.card.completeness_score}/100 · ${t('rating.reward', { count: details.card.reward_points })}`}</Typography>
              <Button
                onClick={() => onOpen(details)}
                sx={{ alignSelf: 'flex-start' }}
              >
                {t('edit')}
              </Button>
            </Stack>
          </Paper>
        ))}
      </Box>
    </>
  )
}
export default CardList
