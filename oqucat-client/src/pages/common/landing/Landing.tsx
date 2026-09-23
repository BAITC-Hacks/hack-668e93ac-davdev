import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { MdArrowForward } from 'react-icons/md'
import { Link } from 'react-router-dom'

import PlatformBrand from '@/components/PlatformBrand'

import LandingAudience from './LandingAudience'
import LandingHeader from './LandingHeader'
import LandingPreview from './LandingPreview'

const steps = ['brief', 'team', 'work', 'result'] as const

const Landing = () => {
  const { t } = useTranslation('user')

  return (
    <Box
      sx={{
        width: 1,
        alignSelf: 'flex-start',
        bgcolor: 'background.default',
        '& section[id]': { scrollMarginTop: 100 },
      }}
    >
      <LandingHeader />
      <Box component="main">
        <Container
          maxWidth="lg"
          component="section"
          sx={{ py: { xs: 6, md: 10 } }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' },
              gap: { xs: 5, md: 7 },
              alignItems: 'center',
            }}
          >
            <Box>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', mb: 3 }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    bgcolor: 'primary.main',
                    borderRadius: '50%',
                  }}
                />
                <Typography
                  sx={{
                    textTransform: 'uppercase',
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                  }}
                >
                  {t('landing.hero.eyebrow')}
                </Typography>
              </Stack>
              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: 42, sm: 58, lg: 68 },
                  fontWeight: 700,
                  lineHeight: 1.06,
                  letterSpacing: '-0.045em',
                }}
              >
                {t('landing.hero.title')}
                <Box
                  component="span"
                  sx={(theme) => ({
                    display: 'block',
                    color: 'primary.dark',
                    ...theme.applyStyles('dark', { color: 'primary.light' }),
                  })}
                >
                  {t('landing.hero.accent')}
                </Box>
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ fontSize: 18, mt: 3, maxWidth: 470, lineHeight: 1.8 }}
              >
                {t('landing.hero.description')}
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{ mt: 4 }}
              >
                <Button
                  component={Link}
                  to="/login"
                  variant="contained"
                  size="large"
                  disableElevation
                  endIcon={<MdArrowForward />}
                  sx={{ borderRadius: 2, py: 1.5 }}
                >
                  {t('landing.hero.student')}
                </Button>
                <Button
                  href="#business"
                  variant="outlined"
                  color="inherit"
                  size="large"
                  sx={{ borderRadius: 2, py: 1.5 }}
                >
                  {t('landing.hero.business')}
                </Button>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {t('landing.hero.note')}
              </Typography>
            </Box>
            <LandingPreview />
          </Box>
        </Container>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              borderTop: 1,
              borderBottom: 1,
              borderColor: 'divider',
              py: 3,
              gap: 3,
            }}
          >
            {['practice', 'collaboration', 'growth'].map((item, index) => (
              <Stack
                direction="row"
                key={item}
                spacing={2}
                sx={{ alignItems: 'center' }}
              >
                <Typography
                  sx={{ color: 'text.secondary', fontSize: 12 }}
                >{`0${index + 1}`}</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: 16 }}>
                  {t(`landing.values.${item}`)}
                </Typography>
              </Stack>
            ))}
          </Box>
        </Container>
        <LandingAudience />
        <Box
          component="section"
          id="how"
          sx={{ bgcolor: '#1d3025', color: '#f5f7f0', py: { xs: 7, md: 9 } }}
        >
          <Container maxWidth="lg">
            <Typography variant="overline" sx={{ color: '#c5d5bd' }}>
              {t('landing.how.eyebrow')}
            </Typography>
            <Typography
              component="h2"
              sx={{
                fontSize: { xs: 30, md: 44 },
                fontWeight: 700,
                mt: 1,
                mb: 5,
              }}
            >
              {t('landing.how.title')}
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(4, 1fr)',
                },
                gap: 4,
              }}
            >
              {steps.map((step, index) => (
                <Box
                  key={step}
                  sx={{ borderTop: '1px solid #56664e', pt: 2.5 }}
                >
                  <Typography
                    sx={{ color: '#c5eb9f', fontSize: 28, mb: 2 }}
                  >{`0${index + 1}`}</Typography>
                  <Typography
                    component="h3"
                    sx={{ fontSize: 20, fontWeight: 700, mb: 1 }}
                  >
                    {t(`landing.how.steps.${step}.title`)}
                  </Typography>
                  <Typography
                    sx={{ color: '#c5d5bd', fontSize: 15, lineHeight: 1.8 }}
                  >
                    {t(`landing.how.steps.${step}.description`)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Container>
        </Box>
        <Container
          maxWidth="lg"
          component="section"
          sx={{ py: { xs: 7, md: 10 } }}
        >
          <Box
            sx={{
              borderRadius: 4,
              bgcolor: '#e4efda',
              color: '#1d3025',
              p: { xs: 3, md: 6 },
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 4,
              alignItems: { md: 'center' },
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ maxWidth: 640 }}>
              <Typography
                component="h2"
                sx={{
                  fontSize: { xs: 30, md: 40 },
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                {t('landing.cta.title')}
              </Typography>
              <Typography sx={{ mt: 2, color: '#4d6145', lineHeight: 1.8 }}>
                {t('landing.cta.description')}
              </Typography>
            </Box>
            <Button
              component={Link}
              to="/login"
              size="large"
              endIcon={<MdArrowForward />}
              sx={{
                bgcolor: '#1d3025',
                color: '#fff',
                borderRadius: 2,
                px: 3,
                py: 1.5,
                flexShrink: 0,
                '&:hover': { bgcolor: '#304b39' },
              }}
            >
              {t('landing.start')}
            </Button>
          </Box>
        </Container>
      </Box>
      <Divider />
      <Container maxWidth="lg" component="footer" sx={{ py: 4 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
        >
          <PlatformBrand />
          <Typography color="text.secondary" sx={{ fontSize: 13 }}>
            {t('landing.footer')}
          </Typography>
          <Button
            component={Link}
            to="/menu"
            color="inherit"
            endIcon={<MdArrowForward />}
          >
            {t('landing.workspace')}
          </Button>
        </Stack>
      </Container>
    </Box>
  )
}

export default Landing
