import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import Grow from '@mui/material/Grow'
import Paper from '@mui/material/Paper'
import { type SxProps, type Theme, useTheme } from '@mui/material/styles'
import Tab, { tabClasses } from '@mui/material/Tab'
import Tabs, { tabsClasses } from '@mui/material/Tabs'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useEffect, useMemo, type SyntheticEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import type { TabItem } from '@/types/TabItem'

interface ITabRespSelector {
  tabs: TabItem[]
}

const styles = {
  tabBox: {
    maxHeight: 1,
    pb: 'var(--safe-bottom)',
  },

  tabPanel: {
    height: {
      sm: 'calc(100% - 75px)',
      xs: 'unset',
    },
    p: {
      sm: 2,
      xs: 0,
    },
    position: 'relative',
    top: 'var(--safe-top)',
  },
  wrapper: (theme: Theme) => ({
    width: '100%',
    borderRadius: 1,
    boxShadow: (theme.vars ?? theme).shadows[8],

    ...theme.applyStyles('dark', {
      boxShadow: '0px 3px 15px rgba(0, 0, 0, 0.7)',
    }),

    [`& .${tabsClasses.indicator}`]: {
      bgcolor: 'rgba(108, 118, 255, 0.2)',
      borderRadius: 1,
      height: '100%',
    },

    [`& .${tabClasses.root}`]: {
      mx: 2,
      minWidth: 0,
      fontWeight: 'normal',
      letterSpacing: 0.5,
      borderRadius: 1,

      [`&.${tabClasses.selected}`]: {
        color: theme.palette.primary,
      },

      [theme.breakpoints.up('md')]: {
        minWidth: 0,
      },
    },
  }),
} satisfies Record<string, SxProps<Theme>>

const TabRespSelector = ({ tabs }: ITabRespSelector) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('sm'))
  const [searchParams, setSearchParams] = useSearchParams()

  const tabIds = useMemo(() => tabs.map((i) => i.id), [tabs])
  const queryTab = searchParams.get('tab')

  const [firstTab] = tabIds
  const tab =
    queryTab !== null && tabIds.includes(queryTab) ? queryTab : firstTab

  const changeTab = (_e: SyntheticEvent, id: string) => {
    setSearchParams({ tab: id })
  }

  useEffect(() => {
    if (queryTab === null || !tabIds.includes(queryTab)) {
      setSearchParams({ tab: firstTab })
    }
  }, [firstTab, queryTab, setSearchParams, tabIds])

  return (
    <Grow in>
      <Paper
        sx={{
          height: { md: 1, xs: tab === 'chat' ? 1 : 'calc(100% - 56px)' },
          m: { md: 3, xs: 0 },
          overflow: 'auto',
          p: { md: 3, xs: 0 },
          width: { md: 0.9, xs: 1 },
        }}
      >
        <TabContext value={tab}>
          {isXs ? (
            <Paper
              elevation={10}
              sx={{
                bottom: 0,
                left: 0,
                pb: 'var(--safe-bottom)',
                position: 'fixed',
                right: 0,
                zIndex: 10,
              }}
            >
              <BottomNavigation
                value={tab}
                onChange={changeTab}
                sx={{
                  justifyContent: 'space-evenly',
                  overflowX: 'auto',
                  overflowY: 'hidden',
                }}
              >
                {tabs.map((tabItem) => (
                  <BottomNavigationAction
                    key={tabItem.id}
                    label={t(`common:navigation.tabs.${tabItem.id}`)}
                    value={tabItem.id}
                    icon={
                      <Box
                        sx={{
                          display: 'inline-flex',
                          fontSize: 30,
                          lineHeight: 1,
                          '& svg': {
                            height: '1em',
                            width: '1em',
                          },
                        }}
                      >
                        <tabItem.icon />
                      </Box>
                    }
                    slotProps={{
                      label: {
                        sx: {
                          fontSize: '0.6rem !important',
                        },
                      },
                    }}
                  />
                ))}
              </BottomNavigation>
            </Paper>
          ) : (
            <Paper elevation={10} sx={{ m: 'auto', maxWidth: 'fit-content' }}>
              <Tabs
                value={tab}
                onChange={changeTab}
                variant="scrollable"
                scrollButtons
                allowScrollButtonsMobile
                sx={styles.wrapper}
              >
                {tabs.map((item) => (
                  <Tab
                    key={item.id}
                    icon={
                      <Box
                        sx={{
                          display: 'inline-flex',
                          fontSize: 28,
                          lineHeight: 1,
                          '& svg': {
                            height: '1em',
                            width: '1em',
                          },
                        }}
                      >
                        <item.icon />
                      </Box>
                    }
                    label={t(`common:navigation.tabs.${item.id}`).toUpperCase()}
                    value={item.id}
                  />
                ))}
              </Tabs>
            </Paper>
          )}
          {tabs.map((item) => (
            <TabPanel
              key={item.id}
              value={item.id}
              keepMounted
              sx={styles.tabPanel}
            >
              <Fade in={item.id === tab}>
                <Box sx={styles.tabBox}>{item.component}</Box>
              </Fade>
            </TabPanel>
          ))}
        </TabContext>
      </Paper>
    </Grow>
  )
}

export default TabRespSelector
