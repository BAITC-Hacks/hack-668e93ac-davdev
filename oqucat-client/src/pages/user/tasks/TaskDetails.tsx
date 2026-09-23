import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { MdArrowBack, MdArrowForward, MdGroups } from 'react-icons/md'
import { Link } from 'react-router-dom'

import type { ProjectCardDetails } from '@/types/Marketplace'

const coreFields = [
  ['context', 'context'],
  ['need', 'need'],
  ['users', 'target_users'],
  ['data', 'data'],
  ['constraints', 'constraints'],
  ['result', 'expected_result'],
  ['success', 'success_criteria'],
  ['contact', 'contact'],
  ['interaction', 'interaction_format'],
] as const

const TaskDetails = ({ task: details }: { task: ProjectCardDetails }) => {
  const { t } = useTranslation('user')
  const { card, company, fields, tags } = details
  const populatedCoreFields = coreFields.filter(([, key]) => card[key])

  return (
    <Stack spacing={3}>
      <Button
        component={Link}
        to="?tab=tasks"
        startIcon={<MdArrowBack />}
        color="inherit"
        sx={{ alignSelf: 'flex-start' }}
      >
        {t('tasks.back')}
      </Button>
      <Box>
        <Typography variant="overline" color="text.secondary">
          {company?.name ?? t('tasks.unknownCompany')}
        </Typography>
        <Typography
          variant="h3"
          component="h1"
          sx={{ fontSize: { xs: 28, md: 40 }, fontWeight: 700, mt: 1 }}
        >
          {card.title}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1.5 }}>
          {card.need ?? card.context ?? t('tasks.noDescription')}
        </Typography>
        {tags.length > 0 && (
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', mt: 2 }}>
            {tags.map((tag) => (
              <Chip key={tag.id} label={tag.name} size="small" />
            ))}
          </Stack>
        )}
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 290px' },
          gap: 3,
          alignItems: 'start',
        }}
      >
        <Paper
          variant="outlined"
          sx={{ borderRadius: 3, p: { xs: 2.5, md: 4 } }}
        >
          <Stack spacing={3} divider={<Divider />}>
            {populatedCoreFields.map(([label, key]) => (
              <Box key={key}>
                <Typography
                  component="h2"
                  sx={{ fontSize: 18, fontWeight: 700, mb: 1 }}
                >
                  {t(`tasks.fields.${label}`)}
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {card[key]}
                </Typography>
              </Box>
            ))}
            {fields.map((field) => (
              <Box key={field.id}>
                <Typography
                  component="h2"
                  sx={{ fontSize: 18, fontWeight: 700, mb: 1 }}
                >
                  {field.label}
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {typeof field.value === 'string'
                    ? field.value
                    : JSON.stringify(field.value)}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Paper>
        <Paper variant="outlined" sx={{ borderRadius: 3, p: 3 }}>
          <Typography variant="overline" color="text.secondary">
            {t('tasks.reward')}
          </Typography>
          <Typography sx={{ fontWeight: 700, fontSize: 32 }}>
            {t('tasks.points', { count: card.reward_points })}
          </Typography>
          <Divider sx={{ my: 3 }} />
          <MdGroups size={28} />
          <Typography sx={{ fontWeight: 700, my: 1 }}>
            {t('tasks.teamOnly')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('tasks.teamRule')}
          </Typography>
          <Button
            component={Link}
            to="?tab=team"
            endIcon={<MdArrowForward />}
            sx={{ mt: 2 }}
          >
            {t('navigation.openTeam')}
          </Button>
        </Paper>
      </Box>
    </Stack>
  )
}

export default TaskDetails
