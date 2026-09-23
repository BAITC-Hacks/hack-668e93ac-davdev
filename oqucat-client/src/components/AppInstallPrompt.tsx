import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MdInstallMobile as InstallMobileIcon } from 'react-icons/md'

import { isTauri } from '@/utils/isTauri'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

const isBeforeInstallPromptEvent = (
  event: Event
): event is BeforeInstallPromptEvent =>
  'prompt' in event &&
  typeof event.prompt === 'function' &&
  'userChoice' in event

const AppInstallPrompt = () => {
  const { t } = useTranslation()

  const isIOS = /iPhone|iPad|iPod/iu.test(globalThis.navigator.userAgent)
  const isMobile = /Android|iPhone|iPad|iPod/iu.test(
    globalThis.navigator.userAgent
  )
  const isStandalone =
    globalThis.matchMedia('(display-mode: standalone)').matches ||
    Reflect.get(globalThis.navigator, 'standalone') === true
  const canInstall = !isTauri && isMobile && !isStandalone

  const [open, setOpen] = useState(canInstall && isIOS)
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    let listener: ((event: Event) => void) | undefined

    if (canInstall) {
      listener = (event: Event) => {
        event.preventDefault()

        if (isBeforeInstallPromptEvent(event)) {
          setDeferredPrompt(event)
          setOpen(true)
        }
      }

      globalThis.addEventListener('beforeinstallprompt', listener)
    }

    return () => {
      if (listener) {
        globalThis.removeEventListener('beforeinstallprompt', listener)
      }
    }
  }, [canInstall])

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      await deferredPrompt.userChoice
      setDeferredPrompt(null)
      setOpen(false)
      return
    }

    if (isIOS) {
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>{t('common:install.title')}</DialogTitle>

      <DialogContent>
        {deferredPrompt
          ? t('common:install.description')
          : isIOS
            ? t('common:install.iosInstructions')
            : t('common:install.description')}
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setOpen(false)}>
          {t('common:actions.later')}
        </Button>

        <Button
          variant="contained"
          startIcon={<InstallMobileIcon />}
          onClick={handleInstall}
        >
          {t('common:actions.install')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AppInstallPrompt
