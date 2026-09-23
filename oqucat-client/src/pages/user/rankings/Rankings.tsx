import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
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

import {
  getStudentLeaderboard,
  getTeamLeaderboard,
} from '@/api/http/marketplace'
import { queryKeys } from '@/api/http/QueryKeys'
import { getAvatar, getLogo } from '@/utils/getAvatar'

type RankingKind = 'students' | 'teams'

const Rankings = () => {
  const { t } = useTranslation('user')
  const [kind, setKind] = useState<RankingKind>('students')
  const { data, isPending, refetch } = useQuery({
    queryKey: queryKeys.leaderboard(kind),
    queryFn: async () => {
      if (kind === 'students') {
        const entries = await getStudentLeaderboard()
        return (
          entries?.map(({ rank, student, rating }) => ({
            rank,
            id: student.user_id,
            name: student.user.name,
            image: getAvatar(student.user.image),
            points: student.points_balance,
            rating,
          })) ?? null
        )
      }

      const entries = await getTeamLeaderboard()
      return (
        entries?.map(({ rank, team, rating }) => ({
          rank,
          id: team.id,
          name: team.name,
          image: getLogo(team.logo ?? undefined),
          points: team.points_balance,
          rating,
        })) ?? null
      )
    },
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
          onChange={(_, value: RankingKind) => setKind(value)}
          aria-label={t('rankings.switch')}
          sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          {(['students', 'teams'] as const).map((item) => (
            <Tab
              key={item}
              id={`ranking-tab-${item}`}
              aria-controls={`ranking-panel-${item}`}
              label={t(`rankings.${item}`)}
              value={item}
            />
          ))}
        </Tabs>
        {isPending && (
          <Stack sx={{ alignItems: 'center', py: 8 }}>
            <CircularProgress aria-label={t('rankings.loading')} />
          </Stack>
        )}
        {!isPending && !data && (
          <Alert
            severity="error"
            action={
              <Button onClick={() => void refetch()}>
                {t('rankings.retry')}
              </Button>
            }
          >
            {t('rankings.loadError')}
          </Alert>
        )}
        {data && (
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
                {data.map((entry) => (
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
                        <Avatar src={entry.image}>
                          {entry.name.slice(0, 1)}
                        </Avatar>
                        <Typography
                          sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
                        >
                          {entry.name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      {entry.rating?.toFixed(1) ?? '—'}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {entry.points}
                    </TableCell>
                  </TableRow>
                ))}
                {data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                      {t('rankings.empty')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
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
