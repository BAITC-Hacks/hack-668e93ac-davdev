import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import LinearProgress from '@mui/material/LinearProgress'
import MenuItem from '@mui/material/MenuItem'
import Pagination from '@mui/material/Pagination'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MdArrowForward, MdSearch } from 'react-icons/md'
import { Link, useSearchParams } from 'react-router-dom'

import { getCards } from '@/api/http/cards'
import { queryKeys } from '@/api/http/QueryKeys'
import { useAuthSession } from '@/auth/betterAuth'
import type { CardFilters } from '@/types/ProjectCard'
import { getMarketplaceError } from '@/utils/getMarketplaceError'

import TaskDetails from './TaskDetails'

const Tasks = () => {
  const { t } = useTranslation('user')
  const { data: session } = useAuthSession()
  const userId = session?.user?.id
  const [params] = useSearchParams()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<CardFilters>({
    page: 1,
    limit: 12,
    search: '',
    sort: 'completeness',
  })
  const taskId = params.get('task')
  const active = !params.get('tab') || params.get('tab') === 'tasks'
  const catalog = useQuery({
    queryKey: queryKeys.cards(userId, filters),
    queryFn: ({ signal }) => getCards(filters, signal),
    enabled: Boolean(userId) && active && !taskId,
    retry: false,
  })
  const clear = () => {
    setSearch('')
    setFilters({ ...filters, search: '', page: 1 })
  }

  if (taskId) {
    return <TaskDetails taskId={taskId} />
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
      <Stack
        component="form"
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        onSubmit={(event) => {
          event.preventDefault()
          setFilters({ ...filters, search: search.trim(), page: 1 })
        }}
      >
        <TextField
          fullWidth
          label={t('tasks.search')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          slotProps={{
            htmlInput: { maxLength: 200 },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <MdSearch />
                </InputAdornment>
              ),
            },
          }}
        />
        <Button type="submit" variant="outlined">
          {t('tasks.find')}
        </Button>
        <TextField
          select
          label={t('tasks.sort')}
          value={filters.sort}
          onChange={(event) => {
            const sort = event.target.value
            if (sort === 'newest' || sort === 'completeness') {
              setFilters({ ...filters, sort, page: 1 })
            }
          }}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="completeness">
            {t('tasks.sortCompleteness')}
          </MenuItem>
          <MenuItem value="newest">{t('tasks.sortNewest')}</MenuItem>
        </TextField>
      </Stack>
      {catalog.isFetching && (
        <LinearProgress aria-label={t('marketplace.loading')} />
      )}
      {catalog.isError && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              onClick={() => {
                void catalog.refetch()
              }}
            >
              {t('marketplace.retry')}
            </Button>
          }
        >
          {getMarketplaceError(catalog.error)}
        </Alert>
      )}
      {catalog.isSuccess && (
        <>
          <Typography color="text.secondary" variant="body2" role="status">
            {t('tasks.found', { count: catalog.data.total })}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                lg: 'repeat(3, minmax(0, 1fr))',
              },
              gap: 2.5,
            }}
          >
            {catalog.data.cards.map(({ card, company }, index) => (
              <Paper
                key={card.id}
                component="article"
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  minWidth: 0,
                  overflowWrap: 'anywhere',
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
                      bgcolor: '#d3edaa',
                      color: '#25301e',
                      borderRadius: 2,
                      px: 1.5,
                      py: 1,
                      fontWeight: 700,
                    }}
                  >
                    {(filters.page - 1) * filters.limit + index + 1}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {t(`cardStatus.${card.status}`)}
                  </Typography>
                </Stack>
                <Typography variant="overline" color="text.secondary">
                  {company?.name ?? t('marketplace.notSpecified')}
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
                  sx={{
                    fontSize: 15,
                    lineHeight: 1.7,
                    mb: 3,
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {card.need || card.context || t('marketplace.notSpecified')}
                </Typography>
                <Typography
                  color="text.secondary"
                  variant="body2"
                  sx={{ mt: 'auto', mb: 2 }}
                >
                  {t('tasks.completeness', { value: card.completeness_score })}
                </Typography>
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
          {catalog.data.cards.length === 0 && (
            <Paper
              variant="outlined"
              sx={{ textAlign: 'center', p: 5, borderRadius: 3 }}
            >
              <Typography component="h2" variant="h6">
                {t('tasks.empty')}
              </Typography>
              <Typography color="text.secondary" sx={{ my: 1 }}>
                {t(
                  filters.search
                    ? 'tasks.emptyDescription'
                    : 'tasks.noPublished'
                )}
              </Typography>
              {filters.search && (
                <Button onClick={clear}>{t('tasks.clear')}</Button>
              )}
              {filters.page > 1 && (
                <Button onClick={() => setFilters({ ...filters, page: 1 })}>
                  {t('tasks.firstPage')}
                </Button>
              )}
            </Paper>
          )}
          {catalog.data.pages > 1 && (
            <Pagination
              count={catalog.data.pages}
              page={filters.page}
              onChange={(_, page) => setFilters({ ...filters, page })}
              aria-label={t('tasks.pagination')}
              size="small"
            />
          )}
        </>
      )}
    </Stack>
  )
}

export default Tasks
