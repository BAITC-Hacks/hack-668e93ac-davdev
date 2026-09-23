import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FaTelegram as TelegramIcon } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'

import { authClient } from '@/auth/betterAuth'
import logger from '@/utils/logger'

import SocialIconButton from './SocialIconButton'
import { isTelegramLoginEvent } from './telegram'

const handleLogin = () => {
  if (globalThis.TelegramNative) {
    globalThis.TelegramNative.login()
    return
  }
  void authClient.signInWithTelegramOIDC({
    callbackURL: '/menu',
  })
}

const TelegramLoginButton = () => {
  const { t } = useTranslation()

  const navigate = useNavigate()
  const { refetch } = authClient.useSession()

  useEffect(() => {
    const processTelegramLogin = async (event: Event) => {
      if (!isTelegramLoginEvent(event)) {
        return
      }

      const { idToken } = event.detail

      const { error } = await authClient.signIn.social({
        provider: 'telegram-oidc',
        idToken: {
          token: idToken,
        },
        callbackURL: '/menu',
        errorCallbackURL: '/error?type=telegram',
      })

      if (error) {
        logger.error('Telegram login failed:', error)
        return
      }

      await refetch()

      void navigate('/menu', { replace: true })
    }

    const handleTelegramLogin = (event: Event) => {
      void processTelegramLogin(event)
    }

    globalThis.addEventListener('telegram-login', handleTelegramLogin)

    return () => {
      globalThis.removeEventListener('telegram-login', handleTelegramLogin)
    }
  }, [navigate, refetch])

  return (
    <SocialIconButton
      ariaLabel={t('common:auth.telegram.signIn')}
      icon={<TelegramIcon />}
      onClick={handleLogin}
    />
  )
}

export default TelegramLoginButton
