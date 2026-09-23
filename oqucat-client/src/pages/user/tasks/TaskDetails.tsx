import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { MdArrowBack, MdArrowForward, MdGroups } from 'react-icons/md'
import { Link } from 'react-router-dom'

import DemoNotice from '@/components/DemoNotice'

import type { DemoTask } from './demoTasks'

const fields = [
  'context',
  'need',
  'users',
  'data',
  'constraints',
  'result',
  'success',
  'contact',
  'interaction',
] as const

const TaskDetails = ({ task }: { task: DemoTask }) => {
  const { t } = useTranslation('user')

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
      <DemoNotice />
      <Box>
        <Typography variant="overline" color="text.secondary">
          {t(`examples.${task.id}.company`)}
        </Typography>
        <Typography
          variant="h3"
          component="h1"
          sx={{ fontSize: { xs: 28, md: 40 }, fontWeight: 700, mt: 1 }}
        >
          {t(`examples.${task.id}.title`)}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1.5 }}>
          {t(`examples.${task.id}.summary`)}
        </Typography>
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
            {fields.map((field) => (
              <Box key={field}>
                <Typography
                  component="h2"
                  sx={{ fontSize: 18, fontWeight: 700, mb: 1 }}
                >
                  {t(`tasks.fields.${field}`)}
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {t(`examples.${task.id}.${field}`)}
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
            {t('tasks.points', { count: task.points })}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {t('tasks.duration', { count: task.weeks })}
          </Typography>
          <Divider sx={{ my: 3 }} />
          <MdGroups size={28} />
          <Typography sx={{ fontWeight: 700, my: 1 }}>
            {t('tasks.teamOnly')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('tasks.teamRule')}
          </Typography>
          <Button fullWidth variant="contained" disabled sx={{ mt: 3 }}>
            {t('tasks.apply')}
          </Button>
          <Typography
            variant="caption"
            color="text.secondary"
            component="p"
            sx={{ mt: 1 }}
          >
            {t('demo.unavailable')}
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
