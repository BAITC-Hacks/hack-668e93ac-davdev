import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MdArrowForward, MdSchedule, MdSearch } from 'react-icons/md'
import { Link, useSearchParams } from 'react-router-dom'

import DemoNotice from '@/components/DemoNotice'

import { demoTasks } from './demoTasks'
import TaskDetails from './TaskDetails'

const Tasks = () => {
  const { t } = useTranslation('user')
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('default')
  const taskId = searchParams.get('task')
  const selectedTask = demoTasks.find((task) => task.id === taskId)
  const normalizedSearch = search.trim().toLocaleLowerCase()
  const filteredTasks = demoTasks
    .filter((task) =>
      [
        t(`examples.${task.id}.title`),
        t(`examples.${task.id}.summary`),
        t(`examples.${task.id}.company`),
      ].some((value) => value.toLocaleLowerCase().includes(normalizedSearch))
    )
    .toSorted((a, b) =>
      sort === 'points' ? b.points - a.points : a.number.localeCompare(b.number)
    )

  if (selectedTask) {
    return <TaskDetails task={selectedTask} />
  }
  if (taskId) {
    return (
      <Stack spacing={2}>
        <Typography component="h1" variant="h5">
          {t('tasks.notFound')}
        </Typography>
        <Button
          component={Link}
          to="?tab=tasks"
          sx={{ alignSelf: 'flex-start' }}
        >
          {t('tasks.back')}
        </Button>
      </Stack>
    )
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="overline" color="text.secondary">
          {t('tasks.eyebrow')}
        </Typography>
        <Typography
          component="h1"
          sx={{ fontSize: { xs: 30, md: 40 }, fontWeight: 700 }}
        >
          {t('tasks.title')}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {t('tasks.subtitle')}
        </Typography>
      </Box>
      <DemoNotice />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          fullWidth
          label={t('tasks.search')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <MdSearch />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          select
          label={t('tasks.sort')}
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="default">{t('tasks.sortDefault')}</MenuItem>
          <MenuItem value="points">{t('tasks.sortPoints')}</MenuItem>
        </TextField>
      </Stack>
      <Typography color="text.secondary" variant="body2" role="status">
        {t('tasks.found', { count: filteredTasks.length })}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, minmax(0, 1fr))' },
          gap: 2.5,
        }}
      >
        {filteredTasks.map((task) => (
          <Paper
            key={task.id}
            component="article"
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              transition: 'border-color 150ms',
              '&:hover': { borderColor: 'primary.main' },
            }}
          >
            <Stack
              direction="row"
              sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 3,
              }}
            >
              <Box
                sx={{
                  bgcolor: task.color,
                  color: '#25301e',
                  borderRadius: 2,
                  px: 1.5,
                  py: 1,
                  fontWeight: 700,
                }}
              >
                {task.number}
              </Box>
              <Typography variant="caption" color="text.secondary">
                {t('demo.example')}
              </Typography>
            </Stack>
            <Typography variant="overline" color="text.secondary">
              {t(`examples.${task.id}.company`)}
            </Typography>
            <Typography
              component="h2"
              sx={{
                fontWeight: 700,
                fontSize: 23,
                lineHeight: 1.3,
                mt: 1,
                mb: 1.5,
              }}
            >
              {t(`examples.${task.id}.title`)}
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ fontSize: 15, lineHeight: 1.7, mb: 3 }}
            >
              {t(`examples.${task.id}.summary`)}
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: 'center',
                mt: 'auto',
                mb: 2,
                color: 'text.secondary',
              }}
            >
              <MdSchedule />
              <Typography variant="body2">
                {t('tasks.duration', { count: task.weeks })}
              </Typography>
            </Stack>
            <Stack
              direction="row"
              sx={{
                gap: 1,
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: 1,
                borderColor: 'divider',
                pt: 2,
              }}
            >
              <Typography sx={{ fontWeight: 700 }}>
                {t('tasks.points', { count: task.points })}
              </Typography>
              <Button
                component={Link}
                to={`?tab=tasks&task=${task.id}`}
                endIcon={<MdArrowForward />}
                size="small"
              >
                {t('tasks.details')}
              </Button>
            </Stack>
          </Paper>
        ))}
      </Box>
      {filteredTasks.length === 0 && (
        <Paper
          variant="outlined"
          sx={{ textAlign: 'center', p: 5, borderRadius: 3 }}
        >
          <Typography component="h2" variant="h6">
            {t('tasks.empty')}
          </Typography>
          <Typography color="text.secondary" sx={{ my: 1 }}>
            {t('tasks.emptyDescription')}
          </Typography>
          <Button onClick={() => setSearch('')}>{t('tasks.clear')}</Button>
        </Paper>
      )}
    </Stack>
  )
}

export default Tasks
