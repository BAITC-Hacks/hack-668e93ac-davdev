import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MdNotificationsActive as NotificationsActiveIcon } from 'react-icons/md'

import { useAuthSession } from '@/auth/betterAuth'
import { registerPush } from '@/notifications'
import {
  checkTauriNotificationPermission,
  requestTauriNotificationPermission,
} from '@/notifications/tauri'
import { isTauri } from '@/utils/isTauri'
import logger from '@/utils/logger'

const isNotificationSupported = 'Notification' in globalThis

const registerPushSafely = async () => {
  try {
    await registerPush()
  } catch (error) {
    logger.error('[Push] registration failed', error)
  }
}

const registerGrantedTauriPush = async () => {
  try {
    if (checkTauriNotificationPermission() === 'granted') {
      await registerPushSafely()
    }
  } catch (error) {
    logger.error('[Push] permission check failed', error)
  }
}

const NotificationsPrompt = () => {
  const { t } = useTranslation()
  const { data } = useAuthSession()
  const user = data?.user

  const [dismissed, setDismissed] = useState(false)
  const [tauriPermission, setTauriPermission] =
    useState<NotificationPermission | null>(() =>
      isTauri ? checkTauriNotificationPermission() : null
    )
  const shouldPrompt =
    Boolean(user?.role) &&
    (isTauri
      ? tauriPermission !== null && tauriPermission !== 'granted'
      : isNotificationSupported && Notification.permission !== 'granted') &&
    !dismissed

  useEffect(() => {
    if (!user?.role) {
      return
    }

    if (isTauri) {
      void registerGrantedTauriPush()
      return
    }

    if (isNotificationSupported && Notification.permission === 'granted') {
      void registerPushSafely()
    }
  }, [user?.role])

  const handleEnableNotifications = async () => {
    if (isTauri) {
      const permission = await requestTauriNotificationPermission()
      setTauriPermission(permission)

      if (permission !== 'granted') {
        setDismissed(true)
        return
      }

      await registerPushSafely()
      return
    }

    const permission = await Notification.requestPermission()

    if (permission === 'granted') {
      setDismissed(true)
    } else {
      return
    }

    await registerPushSafely()
  }

  return (
    <Dialog open={shouldPrompt} onClose={() => setDismissed(true)}>
      <DialogTitle>{t('common:notifications.permission.title')}</DialogTitle>

      <DialogContent>
        {t('common:notifications.permission.description')}
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setDismissed(true)}>
          {t('common:actions.later')}
        </Button>

        <Button
          variant="contained"
          startIcon={<NotificationsActiveIcon />}
          onClick={handleEnableNotifications}
        >
          {t('common:actions.enable')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default NotificationsPrompt
