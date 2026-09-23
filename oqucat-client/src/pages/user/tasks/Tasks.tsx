import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MdArrowForward, MdSearch } from 'react-icons/md'
import { Link, useSearchParams } from 'react-router-dom'

import { getMarketplaceTags, getProjectCards } from '@/api/http/marketplace'
import { queryKeys } from '@/api/http/QueryKeys'

import TaskDetails from './TaskDetails'

const Tasks = () => {
  const { t } = useTranslation('user')
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('default')
  const [tagId, setTagId] = useState('')
  const { data, isPending, refetch } = useQuery({
    queryKey: queryKeys.projectCards(tagId),
    queryFn: async () => (await getProjectCards(tagId || undefined)) ?? null,
  })
  const { data: tags = [], isPending: tagsPending } = useQuery({
    queryKey: queryKeys.marketplaceTags,
    queryFn: async () => (await getMarketplaceTags()) ?? [],
  })
  const tasks = data?.cards ?? []
  const taskId = searchParams.get('task')
  const selectedTask = tasks.find(({ card }) => card.id === taskId)
  const normalizedSearch = search.trim().toLocaleLowerCase()
  const filteredTasks = tasks
    .filter(({ card, company }) =>
      [card.title, card.need, card.context, company?.name].some((value) =>
        value?.toLocaleLowerCase().includes(normalizedSearch)
      )
    )
    .toSorted((a, b) =>
      sort === 'points' ? b.card.reward_points - a.card.reward_points : 0
    )

  if (isPending) {
    return (
      <Stack sx={{ alignItems: 'center', py: 8 }}>
        <CircularProgress aria-label={t('tasks.loading')} />
      </Stack>
    )
  }
  if (!data) {
    return (
      <Alert
        severity="error"
        action={
          <Button onClick={() => void refetch()}>{t('tasks.retry')}</Button>
        }
      >
        {t('tasks.loadError')}
      </Alert>
    )
  }
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
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          select
          label={t('tasks.tag')}
          value={tagId}
          disabled={tagsPending}
          onChange={(event) => setTagId(event.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">{t('tasks.allTags')}</MenuItem>
          {tags.map((tag) => (
            <MenuItem key={tag.id} value={tag.id}>
              {tag.name}
            </MenuItem>
          ))}
        </TextField>
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
        {filteredTasks.map(({ card, company, tags: cardTags }, index) => (
          <Paper
            key={card.id}
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
                  bgcolor: 'action.selected',
                  color: 'text.primary',
                  borderRadius: 2,
                  px: 1.5,
                  py: 1,
                  fontWeight: 700,
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </Box>
            </Stack>
            <Typography variant="overline" color="text.secondary">
              {company?.name ?? t('tasks.unknownCompany')}
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
              {card.title}
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ fontSize: 15, lineHeight: 1.7, mb: 3 }}
            >
              {card.need ?? card.context ?? t('tasks.noDescription')}
            </Typography>
            {cardTags.length > 0 && (
              <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', mb: 3 }}>
                {cardTags.map((tag) => (
                  <Chip
                    key={tag.id}
                    label={tag.name}
                    size="small"
                    onClick={() => setTagId(tag.id)}
                  />
                ))}
              </Stack>
            )}
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
                {t('tasks.points', { count: card.reward_points })}
              </Typography>
              <Button
                component={Link}
                to={`?tab=tasks&task=${card.id}`}
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
