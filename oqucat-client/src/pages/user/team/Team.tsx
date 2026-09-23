import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import {
  MdGroups,
  MdPerson,
  MdVerifiedUser,
  MdArrowForward,
} from 'react-icons/md'
import { Link } from 'react-router-dom'

import DemoNotice from '@/components/DemoNotice'

const rules = [
  { id: 'captain', icon: MdVerifiedUser },
  { id: 'solo', icon: MdPerson },
  { id: 'oneTeam', icon: MdGroups },
] as const

const Team = () => {
  const { t } = useTranslation('user')

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="overline" color="text.secondary">
          {t('team.eyebrow')}
        </Typography>
        <Typography
          component="h1"
          sx={{ fontSize: { xs: 30, md: 40 }, fontWeight: 700 }}
        >
          {t('team.title')}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {t('team.subtitle')}
        </Typography>
      </Box>
      <DemoNotice />
      <Paper
        variant="outlined"
        sx={{ p: { xs: 3, md: 6 }, borderRadius: 3, textAlign: 'center' }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            p: 3,
            bgcolor: 'action.hover',
            borderRadius: '50%',
            mb: 3,
          }}
        >
          <MdGroups size={48} />
        </Box>
        <Typography component="h2" variant="h5" sx={{ fontWeight: 700 }}>
          {t('team.emptyTitle')}
        </Typography>
        <Typography
          color="text.secondary"
          sx={{ maxWidth: 520, mx: 'auto', mt: 2, mb: 3, lineHeight: 1.8 }}
        >
          {t('team.emptyDescription')}
        </Typography>
        <Button variant="contained" size="large" disabled>
          {t('team.create')}
        </Button>
        <Typography
          variant="caption"
          component="p"
          color="text.secondary"
          sx={{ mt: 1.5 }}
        >
          {t('demo.unavailable')}
        </Typography>
        <Button
          component={Link}
          to="?tab=tasks"
          endIcon={<MdArrowForward />}
          sx={{ mt: 2 }}
        >
          {t('team.explore')}
        </Button>
      </Paper>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
          gap: 2,
        }}
      >
        {rules.map((rule) => (
          <Box key={rule.id} sx={{ p: 2.5 }}>
            <rule.icon size={26} />
            <Typography component="h2" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
              {t(`team.rules.${rule.id}.title`)}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {t(`team.rules.${rule.id}.description`)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Stack>
  )
}

export default Team
