import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MdClose, MdMenu } from 'react-icons/md'
import { Link } from 'react-router-dom'

import PlatformBrand from '@/components/PlatformBrand'
import PlatformControls from '@/components/PlatformControls'

const sections = ['students', 'business', 'how'] as const

const LandingHeader = () => {
  const { t } = useTranslation('user')
  const [open, setOpen] = useState(false)

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            py: 2,
          }}
        >
          <PlatformBrand />
          <Stack
            component="nav"
            aria-label={t('navigation.primary')}
            direction="row"
            spacing={1}
            sx={{ display: { xs: 'none', md: 'flex' } }}
          >
            {sections.map((section) => (
              <Button
                key={section}
                color="inherit"
                href={`#${section}`}
                sx={{ fontSize: 14 }}
              >
                {t(`landing.nav.${section}`)}
              </Button>
            ))}
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <PlatformControls />
            </Box>
            <Button
              component={Link}
              to="/login"
              color="inherit"
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              {t('common:auth.signIn')}
            </Button>
            <Button
              component={Link}
              to="/login"
              variant="contained"
              disableElevation
              sx={{
                borderRadius: 2,
                display: { xs: 'none', md: 'inline-flex' },
              }}
            >
              {t('landing.start')}
            </Button>
            <IconButton
              aria-label={t('navigation.open')}
              aria-expanded={open}
              onClick={() => setOpen(true)}
              sx={{ display: { md: 'none' } }}
            >
              <MdMenu />
            </IconButton>
          </Stack>
        </Stack>
      </Container>
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 300,
            maxWidth: '90vw',
            p: 3,
            pt: 'max(24px, var(--safe-top))',
          },
        }}
      >
        <Stack spacing={3}>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <PlatformBrand />
            <IconButton
              aria-label={t('navigation.close')}
              onClick={() => setOpen(false)}
            >
              <MdClose />
            </IconButton>
          </Stack>
          <Stack
            component="nav"
            aria-label={t('navigation.primary')}
            spacing={1}
          >
            {sections.map((section) => (
              <Button
                key={section}
                href={`#${section}`}
                color="inherit"
                onClick={() => setOpen(false)}
                sx={{ justifyContent: 'flex-start' }}
              >
                {t(`landing.nav.${section}`)}
              </Button>
            ))}
          </Stack>
          <PlatformControls />
          <Button component={Link} to="/login" variant="contained">
            {t('landing.start')}
          </Button>
          <Button component={Link} to="/login" color="inherit">
            {t('common:auth.signIn')}
          </Button>
        </Stack>
      </Drawer>
    </Box>
  )
}

export default LandingHeader
