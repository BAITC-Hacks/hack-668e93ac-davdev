import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MdEmojiEvents } from 'react-icons/md'
import { useSearchParams } from 'react-router-dom'

import {
  getStudentLeaderboard,
  getTeamLeaderboard,
} from '@/api/http/leaderboards'
import { queryKeys } from '@/api/http/QueryKeys'
import { useAuthSession } from '@/auth/betterAuth'
import { getAvatar } from '@/utils/getAvatar'
import { getMarketplaceError, isWebUrl } from '@/utils/getMarketplaceError'

const Rankings = () => {
  const { t, i18n } = useTranslation('user')
  const { data: session } = useAuthSession()
  const userId = session?.user?.id
  const [params] = useSearchParams()
  const [kind, setKind] = useState<'students' | 'teams'>('students')
  const ranking = useQuery({
    queryKey: queryKeys.leaderboard(userId, kind),
    queryFn: async ({ signal }) => {
      if (kind === 'students') {
        const rows = await getStudentLeaderboard(signal)
        return rows.map((entry) => ({
          id: entry.student.user_id,
          rank: entry.rank,
          name: entry.student.user?.name ?? entry.student.user_id,
          image: getAvatar(entry.student.user?.image),
          points: entry.student.points_balance,
          rating: entry.rating,
        }))
      }
      const rows = await getTeamLeaderboard(signal)
      return rows.map((entry) => ({
        id: entry.team.id,
        rank: entry.rank,
        name: entry.team.name,
        image:
          entry.team.logo && isWebUrl(entry.team.logo)
            ? entry.team.logo
            : undefined,
        points: entry.team.points_balance,
        rating: entry.rating,
      }))
    },
    enabled: Boolean(userId) && params.get('tab') === 'rankings',
    retry: false,
  })

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="overline" color="text.secondary">
          {t('rankings.eyebrow')}
        </Typography>
        <Typography
          component="h1"
          sx={{ fontSize: { xs: 30, md: 40 }, fontWeight: 700 }}
        >
          {t('rankings.title')}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {t('rankings.subtitle')}
        </Typography>
      </Box>
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs
          value={kind}
          onChange={(_, value: 'students' | 'teams') => setKind(value)}
          aria-label={t('rankings.switch')}
          sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          {['students', 'teams'].map((item) => (
            <Tab
              key={item}
              id={`ranking-tab-${item}`}
              aria-controls={`ranking-panel-${item}`}
              label={t(`rankings.${item}`)}
              value={item}
            />
          ))}
        </Tabs>
        {ranking.isFetching && (
          <LinearProgress aria-label={t('marketplace.loading')} />
        )}
        {ranking.isError && (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                onClick={() => {
                  void ranking.refetch()
                }}
              >
                {t('marketplace.retry')}
              </Button>
            }
          >
            {getMarketplaceError(ranking.error)}
          </Alert>
        )}
        <TableContainer
          role="tabpanel"
          tabIndex={0}
          id={`ranking-panel-${kind}`}
          aria-labelledby={`ranking-tab-${kind}`}
        >
          <Table sx={{ minWidth: 490 }} aria-label={t(`rankings.${kind}`)}>
            <TableHead>
              <TableRow>
                <TableCell>{t('rankings.place')}</TableCell>
                <TableCell>
                  {t(
                    kind === 'students' ? 'rankings.student' : 'rankings.team'
                  )}
                </TableCell>
                <TableCell align="right">{t('rankings.rating')}</TableCell>
                <TableCell align="right">{t('rankings.points')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ranking.isSuccess &&
                ranking.data.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell sx={{ width: 70, fontWeight: 700 }}>
                      {entry.rank}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{ alignItems: 'center' }}
                      >
                        <Avatar
                          src={entry.image}
                          sx={{
                            bgcolor:
                              entry.rank === 1 ? '#d3edaa' : 'action.selected',
                            color:
                              entry.rank === 1 ? '#25301e' : 'text.primary',
                          }}
                        >
                          {entry.name.slice(0, 1)}
                        </Avatar>
                        <Typography
                          sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}
                        >
                          {entry.name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      {entry.rating === null
                        ? t('rankings.noRating')
                        : new Intl.NumberFormat(i18n.resolvedLanguage, {
                            maximumFractionDigits: 1,
                          }).format(entry.rating)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {entry.points}
                    </TableCell>
                  </TableRow>
                ))}
              {ranking.isSuccess && ranking.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', py: 5 }}>
                    {t('rankings.empty')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Stack
        direction="row"
        spacing={2}
        sx={{ p: 3, alignItems: 'flex-start' }}
      >
        <Box sx={{ fontSize: 30, display: 'flex' }}>
          <MdEmojiEvents />
        </Box>
        <Box>
          <Typography component="h2" sx={{ fontWeight: 700 }}>
            {t('rankings.aboutTitle')}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {t('rankings.about')}
          </Typography>
        </Box>
      </Stack>
    </Stack>
  )
}

export default Rankings
