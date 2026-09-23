import { useColorScheme, useTheme } from '@mui/material/styles'
import type { ReactNode } from 'react'
import {
  MdChat as ChatIcon,
  MdCheckCircle as CheckCircleIcon,
  MdError as ErrorIcon,
  MdInfo as InfoIcon,
  MdWarning as WarningIcon,
} from 'react-icons/md'

import SwipeToast from '@/components/react-bits/SwipeToast'
import type { NotifySeverity } from '@/types/NotifySeverity'
import { useThemeColors } from '@/utils/useThemeColors'

interface ToastContentProps {
  title: string
  message?: string
  severity: NotifySeverity
  onClose?: () => void
  actionLabel?: string
  onAction?: () => void
  icon?: ReactNode
}

const defaultIcons = {
  success: <CheckCircleIcon />,
  error: <ErrorIcon />,
  warning: <WarningIcon />,
  info: <InfoIcon />,
  msg: <ChatIcon />,
}

const ToastContent = ({
  title,
  message,
  severity,
  onClose,
  actionLabel,
  onAction,
  icon,
}: ToastContentProps) => {
  const { mode, systemMode } = useColorScheme()
  const isDark = mode === 'dark' || (mode === 'system' && systemMode === 'dark')
  const colors = useThemeColors()
  const { darken, lighten } = useTheme()
  const color = colors[severity]
  const recolor = isDark ? darken : lighten

  return (
    <SwipeToast
      title={title}
      description={message}
      icon={icon ?? defaultIcons[severity]}
      onClose={() => {
        onClose?.()
      }}
      onAction={onAction}
      actionLabel={actionLabel}
      fuseColor={color}
      closeButton
      background={recolor(color, 0.9)}
      inline
      color={colors.foreground}
      duration={20_000}
    />
  )
}

export default ToastContent
