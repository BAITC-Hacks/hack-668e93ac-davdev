import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MdArrowBack, MdClose, MdMenu, MdSchool } from 'react-icons/md'
import { Link } from 'react-router-dom'

import type { TabItem } from '@/types/TabItem'

import PlatformBrand from './PlatformBrand'
import PlatformControls from './PlatformControls'

interface UserNavigationProps {
  tabs: TabItem[]
  tab: string
  onSelect: (id: string) => void
}

const UserNavigation = ({ tabs, tab, onSelect }: UserNavigationProps) => {
  const { t } = useTranslation('user')
  const [menuOpen, setMenuOpen] = useState(false)
  const navigation = (
    <Stack sx={{ height: 1, p: 2.5, gap: 3 }}>
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <PlatformBrand />
        <IconButton
          aria-label={t('navigation.close')}
          onClick={() => setMenuOpen(false)}
          sx={{ display: { md: 'none' } }}
        >
          <MdClose />
        </IconButton>
      </Stack>
      <Box>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', px: 1.5 }}
        >
          {t('navigation.workspace')}
        </Typography>
        <List
          component="nav"
          aria-label={t('navigation.primary')}
          sx={{ mt: 1 }}
        >
          {tabs.map((item) => (
            <ListItemButton
              key={item.id}
              component={Link}
              to={`?tab=${item.id}`}
              selected={item.id === tab}
              aria-current={item.id === tab ? 'page' : undefined}
              onClick={() => setMenuOpen(false)}
              sx={{
                borderRadius: 2,
                mb: 0.75,
                py: 1.25,
                '&.Mui-selected': {
                  bgcolor: 'action.selected',
                  fontWeight: 700,
                },
              }}
            >
              <ListItemIcon
                sx={{ minWidth: 36, color: 'inherit', fontSize: 22 }}
              >
                <item.icon />
              </ListItemIcon>
              <ListItemText
                primary={t(`common:navigation.tabs.${item.id}`)}
                slotProps={{ primary: { sx: { fontSize: 15 } } }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>
      <Box
        sx={{ mt: 'auto', p: 2, bgcolor: 'action.hover', borderRadius: 2.5 }}
      >
        <MdSchool size={24} />
        <Typography sx={{ fontWeight: 700, mt: 1 }}>
          {t('navigation.teamTitle')}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5, fontSize: 13 }}
        >
          {t('navigation.teamDescription')}
        </Typography>
        <Button
          size="small"
          onClick={() => {
            onSelect('team')
            setMenuOpen(false)
          }}
          sx={{ mt: 1, p: 0 }}
        >
          {t('navigation.openTeam')}
        </Button>
      </Box>
      <Button
        component={Link}
        to="/"
        color="inherit"
        startIcon={<MdArrowBack />}
        sx={{ justifyContent: 'flex-start' }}
      >
        {t('navigation.home')}
      </Button>
    </Stack>
  )

  return (
    <Box
      sx={{
        display: 'flex',
        width: 1,
        height: 1,
        minHeight: 0,
        bgcolor: 'background.default',
      }}
    >
      <Box
        component="aside"
        sx={{
          width: 250,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          borderRight: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          overflowY: 'auto',
        }}
      >
        {navigation}
      </Box>
      <Drawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        sx={{
          display: { md: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            maxWidth: '90vw',
            pt: 'var(--safe-top)',
            pb: 'var(--safe-bottom)',
          },
        }}
      >
        {navigation}
      </Drawer>
      <Stack sx={{ flex: 1, minWidth: 0, minHeight: 0 }}>
        <Stack
          component="header"
          direction="row"
          sx={{
            px: { xs: 2, md: 4 },
            py: 1.5,
            gap: 1,
            alignItems: 'center',
            bgcolor: 'background.paper',
          }}
        >
          <IconButton
            aria-label={t('navigation.open')}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            sx={{ display: { md: 'none' } }}
          >
            <MdMenu />
          </IconButton>
          <Typography sx={{ fontSize: 14, color: 'text.secondary', flex: 1 }}>
            {t(`common:navigation.tabs.${tab}`)}
          </Typography>
          <PlatformControls />
        </Stack>
        <Divider />
        <Box
          component="main"
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            p: { xs: 2, sm: 3, lg: 4 },
            pb: 'max(24px, var(--safe-bottom))',
          }}
        >
          <TabContext value={tab}>
            {tabs.map((item) => (
              <TabPanel
                key={item.id}
                value={item.id}
                keepMounted
                role="region"
                aria-label={t(`common:navigation.tabs.${item.id}`)}
                aria-labelledby={undefined}
                sx={{ p: 0, maxWidth: 1200, mx: 'auto' }}
              >
                {item.component}
              </TabPanel>
            ))}
          </TabContext>
        </Box>
      </Stack>
    </Box>
  )
}

export default UserNavigation
