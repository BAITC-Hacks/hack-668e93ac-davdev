import { signIn as googleSignIn } from '@choochmeque/tauri-plugin-google-auth-api'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaGoogle as GoogleIcon } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'

import { authClient } from '@/auth/betterAuth'
import { googleID } from '@/config'
import logger from '@/utils/logger'

import SocialIconButton from './SocialIconButton'

const isTauri =
  typeof globalThis !== 'undefined' && '__TAURI_INTERNALS__' in globalThis

const GoogleButton = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { refetch } = authClient.useSession()
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setLoading(true)
    if (!isTauri) {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/menu',
        errorCallbackURL: '/error?type=google',
      })
      setLoading(false)
      return
    }

    try {
      const tokens = await googleSignIn({
        clientId: googleID,
        scopes: ['openid', 'email', 'profile'],
        flowType: 'native',
      })

      if (!tokens.idToken) {
        return
      }

      logger.debug('Google sign-in token received')

      const { error } = await authClient.signIn.social({
        provider: 'google',
        idToken: {
          token: tokens.idToken,
          accessToken: tokens.accessToken,
        },
        callbackURL: '/menu',
        errorCallbackURL: '/error?type=google',
      })

      if (error) {
        logger.error('Better Auth Google sign-in failed:', error)
        return
      }

      await refetch()

      void navigate('/menu', { replace: true })
    } catch (error) {
      logger.error('Google native sign-in failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SocialIconButton
      ariaLabel={t('common:auth.google.signIn')}
      icon={<GoogleIcon />}
      loading={loading}
      onClick={() => void handleGoogleLogin()}
    />
  )
}

export default GoogleButton
