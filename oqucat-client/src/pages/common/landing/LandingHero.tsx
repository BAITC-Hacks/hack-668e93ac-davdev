import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { MdArrowForward, MdNorthEast } from 'react-icons/md'
import { Link } from 'react-router-dom'

const VasyaDisplay = lazy(() => import('@/components/vasya/VasyaDisplay'))

const LandingHero = () => {
  const { t } = useTranslation('user')

  return (
    <Container
      maxWidth="lg"
      component="section"
      sx={{ pt: { xs: 4, md: 7 }, pb: { xs: 5, md: 7 } }}
    >
      <Box
        sx={{
          position: 'relative',
          isolation: 'isolate',
          overflow: 'hidden',
          borderRadius: { xs: 3, md: 5 },
          bgcolor: 'action.hover',
          px: { xs: 2.5, sm: 4, md: 6 },
          py: { xs: 4, md: 6 },
        }}
      >
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            width: { xs: 320, md: 550 },
            height: { xs: 320, md: 550 },
            right: { xs: '-15%', md: '-4%' },
            top: { xs: '25%', md: '5%' },
            borderRadius: '50%',
            bgcolor: 'primary.main',
            opacity: 0.16,
            zIndex: -1,
          }}
        />
        <Typography
          variant="overline"
          sx={{ letterSpacing: '0.12em', color: 'text.secondary' }}
        >
          {t('landing.hero.eyebrow')}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1.1fr' },
            alignItems: 'center',
            gap: { xs: 0, md: 2 },
          }}
        >
          <Box
            sx={{
              display: { xs: 'contents', md: 'block' },
              position: 'relative',
              zIndex: 1,
              pt: 2,
            }}
          >
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: 36, sm: 48, lg: 60 },
                gridRow: { xs: 1, md: 'auto' },
                mt: { xs: 2, md: 0 },
                lineHeight: 1.08,
                fontWeight: 700,
                letterSpacing: '-0.04em',
              }}
            >
              {t('landing.vasya.title')}
              <Box
                component="span"
                sx={(theme) => ({
                  display: 'block',
                  color: 'primary.dark',
                  ...theme.applyStyles('dark', { color: 'primary.light' }),
                })}
              >
                {t('landing.vasya.accent')}
              </Box>
            </Typography>
            <Typography
              sx={{
                mt: 3,
                gridRow: { xs: 3, md: 'auto' },
                maxWidth: 450,
                lineHeight: 1.8,
                fontSize: 18,
                color: 'text.secondary',
              }}
            >
              {t('landing.vasya.description')}
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row', md: 'column', lg: 'row' }}
              spacing={1.5}
              sx={{
                mt: 4,
                gridRow: { xs: 4, md: 'auto' },
                alignItems: { md: 'flex-start' },
              }}
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
                endIcon={<MdNorthEast />}
                sx={{ borderRadius: 2, py: 1.5 }}
              >
                {t('landing.hero.business')}
              </Button>
            </Stack>
          </Box>
          <Box sx={{ gridRow: { xs: 2, md: 'auto' }, minWidth: 0 }}>
            <Box
              role="img"
              aria-label={t('landing.vasya.scene')}
              sx={{
                height: { xs: 300, sm: 360, md: 470 },
                width: 1,
                minWidth: 0,
              }}
            >
              <Suspense
                fallback={
                  <Stack
                    sx={{
                      height: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CircularProgress aria-label={t('landing.vasya.loading')} />
                  </Stack>
                }
              >
                <VasyaDisplay />
              </Suspense>
            </Box>
            <Typography
              sx={{
                textAlign: 'center',
                fontSize: 13,
                color: 'text.secondary',
                mt: -2,
              }}
            >
              {t('landing.vasya.caption')}
            </Typography>
          </Box>
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: { xs: 3, md: 1 } }}
        >
          {t('landing.hero.note')}
        </Typography>
      </Box>
    </Container>
  )
}

export default LandingHero
