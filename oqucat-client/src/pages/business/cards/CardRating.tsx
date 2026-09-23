import {
  Alert,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { CardReview } from '@/types/ProjectCard'

import { readiness } from './cardForm'

const CardRating = ({
  review,
  score,
  reward,
  stale,
}: {
  review?: CardReview | null
  score: number
  reward: number
  stale: boolean
}) => {
  const { t } = useTranslation('business')
  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h6">{t('rating.title')}</Typography>
        {stale ? (
          <Alert severity="info">{t('rating.stale')}</Alert>
        ) : (
          <>
            <Typography variant="h3">
              {score}
              <Typography component="span" color="text.secondary">
                {' / 100'}
              </Typography>
            </Typography>
            <LinearProgress variant="determinate" value={score} />
            <Chip
              label={t(`readiness.${readiness(score)}`)}
              sx={{ alignSelf: 'flex-start' }}
            />
            <Typography>{t('rating.reward', { count: reward })}</Typography>
          </>
        )}
        {review?.rating &&
          !stale &&
          Object.entries(review.rating).map(([key, item]) => (
            <Stack key={key} spacing={0.5}>
              <Typography
                sx={{ fontWeight: 600 }}
              >{`${t(`criteria.${key}`)} · ${item.points}/${item.max_points}`}</Typography>
              <Typography variant="body2">{item.got}</Typography>
              {item.points < item.max_points && (
                <Typography variant="body2" color="text.secondary">
                  {item.expected}
                </Typography>
              )}
            </Stack>
          ))}
        <Typography variant="body2" color="text.secondary">
          {t('rating.explanation')}
        </Typography>
      </Stack>
    </Paper>
  )
}
export default CardRating
