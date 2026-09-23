import { useColorScheme, useTheme } from '@mui/material/styles'

import type { NotifySeverity } from '@/types/NotifySeverity'

export type ThemeColors = {
  background: string
  divider: string
  paper: string
  primary: string
  primaryLight: string
  secondary: string
  text: string
  contrastText: string
  foreground: string
} & Record<NotifySeverity, string>

export const useThemeColors = (): ThemeColors => {
  const theme = useTheme()
  const { mode, systemMode } = useColorScheme()

  const resolvedMode = mode === 'system' ? systemMode : mode
  const isDark = resolvedMode === 'dark'

  return {
    // background: theme.palette.background.default,
    divider: theme.palette.divider,
    paper: theme.palette.background.paper,
    primary: theme.palette.primary.main,
    primaryLight: theme.palette.primary.light,
    secondary: theme.palette.secondary.main,
    text: theme.palette.text.primary,
    contrastText: theme.palette.primary.contrastText,
    foreground: isDark ? '#fff' : '#000',
    background: isDark ? '#000' : '#fff',
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main,
    msg: '#fff',
  }
}
