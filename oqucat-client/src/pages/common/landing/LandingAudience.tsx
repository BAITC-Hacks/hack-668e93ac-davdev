import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import {
  MdBusinessCenter,
  MdCheck,
  MdGroups,
  MdNorthEast,
} from 'react-icons/md'
import { Link } from 'react-router-dom'

const audiences = [
  {
    id: 'students',
    icon: MdGroups,
    number: '01',
    points: ['practice', 'team', 'portfolio'],
  },
  {
    id: 'business',
    icon: MdBusinessCenter,
    number: '02',
    points: ['brief', 'ideas', 'result'],
  },
] as const

const LandingAudience = () => {
  const { t } = useTranslation('user')
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
      <Typography variant="overline" color="text.secondary">
        {t('landing.audience.eyebrow')}
      </Typography>
      <Typography
        component="h2"
        sx={{
          fontSize: { xs: 30, md: 44 },
          fontWeight: 700,
          lineHeight: 1.15,
          maxWidth: 660,
          mt: 1,
          mb: 4,
        }}
      >
        {t('landing.audience.title')}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
        }}
      >
        {audiences.map((audience) => (
          <Paper
            key={audience.id}
            component="section"
            id={audience.id}
            variant="outlined"
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Stack
              direction="row"
              sx={{
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 4,
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  display: 'flex',
                  bgcolor: 'action.hover',
                  borderRadius: 2,
                }}
              >
                <audience.icon size={28} />
              </Box>
              <Typography color="text.secondary" variant="overline">
                {audience.number}
              </Typography>
            </Stack>
            <Typography component="h3" sx={{ fontSize: 28, fontWeight: 700 }}>
              {t(`landing.${audience.id}.title`)}
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ mt: 1.5, lineHeight: 1.8 }}
            >
              {t(`landing.${audience.id}.description`)}
            </Typography>
            <Stack
              component="ul"
              spacing={2}
              sx={{ listStyle: 'none', p: 0, my: 3 }}
            >
              {audience.points.map((point) => (
                <Stack
                  component="li"
                  key={point}
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: 'flex-start' }}
                >
                  <Box sx={{ display: 'flex', color: 'primary.dark', pt: 0.4 }}>
                    <MdCheck />
                  </Box>
                  <Typography variant="body2">
                    {t(`landing.${audience.id}.points.${point}`)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
            <Button
              component={Link}
              to="/login"
              endIcon={<MdNorthEast />}
              color="inherit"
              sx={{ mt: 'auto', alignSelf: 'flex-start', p: 0 }}
            >
              {t('landing.start')}
            </Button>
          </Paper>
        ))}
      </Box>
    </Container>
  )
}

export default LandingAudience
