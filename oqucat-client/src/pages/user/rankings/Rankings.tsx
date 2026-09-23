import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
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
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MdEmojiEvents } from 'react-icons/md'

import DemoNotice from '@/components/DemoNotice'

const scores = [
  { id: 'first', points: 960, completed: 4 },
  { id: 'second', points: 740, completed: 3 },
  { id: 'third', points: 560, completed: 2 },
]

const Rankings = () => {
  const { t } = useTranslation('user')
  const [kind, setKind] = useState('students')

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
      <DemoNotice />
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs
          value={kind}
          onChange={(_, value: string) => setKind(value)}
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
                <TableCell align="right">{t('rankings.completed')}</TableCell>
                <TableCell align="right">{t('rankings.points')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scores.map((entry, index) => (
                <TableRow key={entry.id}>
                  <TableCell sx={{ width: 70, fontWeight: 700 }}>
                    {index + 1}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    <Stack
                      direction="row"
                      spacing={1.5}
                      sx={{ alignItems: 'center' }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: index === 0 ? '#d3edaa' : 'action.selected',
                          color: index === 0 ? '#25301e' : 'text.primary',
                        }}
                      >
                        {t(`rankings.names.${kind}.${entry.id}`).slice(0, 1)}
                      </Avatar>
                      <Typography
                        sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
                      >
                        {t(`rankings.names.${kind}.${entry.id}`)}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">{entry.completed}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {entry.points}
                  </TableCell>
                </TableRow>
              ))}
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
