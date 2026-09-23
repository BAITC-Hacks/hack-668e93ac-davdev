import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { authClient } from '@/auth/betterAuth'
import logger from '@/utils/logger'

import SocialIconButton from './SocialIconButton'

type OAuthProvider = 'github' | 'microsoft' | 'facebook'

interface OAuthButtonProps {
  icon: ReactNode
  provider: OAuthProvider
  translationKey: `common:auth.${OAuthProvider}.signIn`
}

const OAuthButton = ({ icon, provider, translationKey }: OAuthButtonProps) => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const label = t(translationKey)

  const handleLogin = async () => {
    setLoading(true)

    try {
      await authClient.signIn.social({
        provider,
        callbackURL: '/menu',
        errorCallbackURL: `/error?type=${provider}`,
      })
    } catch (error) {
      logger.error(`${provider} sign-in failed:`, error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SocialIconButton
      ariaLabel={label}
      icon={icon}
      loading={loading}
      onClick={() => void handleLogin()}
    />
  )
}

export default OAuthButton
