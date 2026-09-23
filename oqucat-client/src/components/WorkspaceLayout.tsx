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
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MdArrowBack, MdClose, MdMenu } from 'react-icons/md'
import { Link, useSearchParams } from 'react-router-dom'

import type { WorkspaceItem } from '@/types/WorkspaceItem'

import PlatformBrand from './PlatformBrand'
import PlatformControls from './PlatformControls'

type WorkspaceKind = 'student' | 'business' | 'superadmin' | 'onboarding'

interface WorkspaceLayoutProps {
  items: WorkspaceItem[]
  workspace: WorkspaceKind
}

const WorkspaceLayout = ({ items, workspace }: WorkspaceLayoutProps) => {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const itemIds = useMemo(() => items.map(({ id }) => id), [items])
  const requestedItem = searchParams.get('tab')
  const activeId =
    requestedItem && itemIds.includes(requestedItem)
      ? requestedItem
      : itemIds[0]
  const activeItem = items.find(({ id }) => id === activeId)

  const selectItem = (id: string) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.set('tab', id)
        next.delete('chat')
        return next
      },
      { replace: true }
    )
    setMenuOpen(false)
  }

  useEffect(() => {
    if (activeId && requestedItem !== activeId) {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          next.set('tab', activeId)
          return next
        },
        { replace: true }
      )
    }
  }, [activeId, requestedItem, setSearchParams])

  if (!activeItem) {
    return null
  }

  const navigation = (
    <Stack sx={{ height: 1, p: 2.5, gap: 3 }}>
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <PlatformBrand />
        <IconButton
          aria-label={t('common:navigation.close')}
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
          {t(`common:navigation.workspaces.${workspace}`)}
        </Typography>
        <List
          component="nav"
          aria-label={t('common:navigation.primary')}
          sx={{ mt: 1 }}
        >
          {items.map((item) => (
            <ListItemButton
              key={item.id}
              selected={item.id === activeId}
              aria-current={item.id === activeId ? 'page' : undefined}
              onClick={() => selectItem(item.id)}
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

      <Button
        component={Link}
        to="/"
        color="inherit"
        startIcon={<MdArrowBack />}
        sx={{ mt: 'auto', justifyContent: 'flex-start' }}
      >
        {t('common:navigation.home')}
      </Button>
    </Stack>
  )

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100vw',
        height: '100dvh',
        minHeight: 0,
        bgcolor: 'background.default',
      }}
    >
      <Box
        component="aside"
        sx={{
          width: 280,
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
            minHeight: 68,
            px: { xs: 2, md: 4 },
            gap: 1,
            alignItems: 'center',
            bgcolor: 'background.paper',
          }}
        >
          <IconButton
            aria-label={t('common:navigation.open')}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            sx={{ display: { md: 'none' } }}
          >
            <MdMenu />
          </IconButton>
          <Typography sx={{ fontSize: 14, color: 'text.secondary', flex: 1 }}>
            {t(`common:navigation.tabs.${activeId}`)}
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
          <Box sx={{ width: 1, maxWidth: 1440, mx: 'auto' }}>
            {activeItem.component}
          </Box>
        </Box>
      </Stack>
    </Box>
  )
}

export default WorkspaceLayout
