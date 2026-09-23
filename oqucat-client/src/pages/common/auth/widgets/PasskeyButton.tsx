import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MdFingerprint as FingerprintIcon } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'

import { authClient } from '@/auth/betterAuth'
import { notify } from '@/context/notification/notify'

import SocialIconButton from './SocialIconButton'

const PasskeyButton = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { refetch } = authClient.useSession()
  const [loading, setLoading] = useState(false)
  const label = t('common:auth.passkey.signIn')

  const handleLogin = async () => {
    setLoading(true)

    try {
      const { error } = await authClient.signIn.passkey()

      if (error) {
        notify.error(error.message ?? t('common:auth.passkey.signInFailed'))
        return
      }

      await refetch()
      void navigate('/menu', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <SocialIconButton
      ariaLabel={label}
      icon={<FingerprintIcon />}
      loading={loading}
      onClick={() => void handleLogin()}
    />
  )
}

export default PasskeyButton
