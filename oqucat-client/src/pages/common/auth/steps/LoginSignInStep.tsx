import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { Dispatch, SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { authError } from '@/auth/authError'
import { authClient } from '@/auth/betterAuth'
import Captcha from '@/pages/common/auth/Captcha'
import PasswordField from '@/pages/common/auth/PasswordField'
import GoogleButton from '@/pages/common/auth/widgets/GoogleButton'
import {
  FacebookButton,
  GithubButton,
} from '@/pages/common/auth/widgets/OAuthButton'
import PasskeyButton from '@/pages/common/auth/widgets/PasskeyButton'
import TelegramLoginButton from '@/pages/common/auth/widgets/TelegramLoginButton'
import type { EmailCheckStatus } from '@/types/EmailCheckResult'
import { addRecentAccount } from '@/utils/recentAccounts/addRecentAccount'

interface ILoginSignInStep {
  email: string
  status: EmailCheckStatus
  password: string
  setPassword: Dispatch<SetStateAction<string>>
  onReturn: () => void
  loading: boolean
  setLoading: Dispatch<SetStateAction<boolean>>
  captchaToken: string
  setCaptchaToken: Dispatch<SetStateAction<string>>
}

const LoginSignInStep = ({
  email,
  status,
  password,
  setPassword,
  onReturn,
  loading,
  setLoading,
  captchaToken,
  setCaptchaToken,
}: ILoginSignInStep) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const submitSignIn = async () => {
    if (!email || !password) {
      return
    }

    setLoading(true)
    const { error, data } = await authClient.signIn.email(
      {
        email,
        password,
        rememberMe: true,
        callbackURL: '/menu',
      },
      { headers: { 'x-captcha-response': captchaToken } }
    )
    setLoading(false)

    if (error) {
      setCaptchaToken('')
      if (error.code === 'EMAIL_NOT_VERIFIED') {
        void navigate('/confirm-email', {
          state: { email, password },
        })
      } else {
        return authError(error)
      }

      return
    }

    addRecentAccount(data.user)
  }
  return (
    <>
      <Captcha captchaToken={captchaToken} setCaptchaToken={setCaptchaToken} />
      <Typography variant="h6">{t('common:auth.signIn')}</Typography>

      <TextField label="Email" value={email} fullWidth disabled />

      {(status.includes('google') ||
        status.includes('telegram-oidc') ||
        status.includes('github') ||
        status.includes('microsoft') ||
        status.includes('facebook') ||
        status.includes('passkey')) && (
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
          {status.includes('google') && <GoogleButton />}
          {status.includes('telegram-oidc') && <TelegramLoginButton />}
          {status.includes('github') && <GithubButton />}
          {/* {status.includes('microsoft') && <MicrosoftButton />} */}
          {status.includes('facebook') && <FacebookButton />}
          {status.includes('passkey') && <PasskeyButton />}
        </Stack>
      )}

      {status.includes('credential') && (
        <>
          {(status.includes('google') ||
            status.includes('telegram-oidc') ||
            status.includes('github') ||
            status.includes('microsoft') ||
            status.includes('facebook') ||
            status.includes('passkey')) && (
            <Divider>{t('common:labels.or')}</Divider>
          )}
          <PasswordField
            password={password}
            setPassword={setPassword}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                void submitSignIn()
              }
            }}
          />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              mt: 0.5,
            }}
          >
            <Button
              variant="text"
              size="small"
              onClick={() =>
                void navigate('/forgot-password', {
                  state: email,
                })
              }
              fullWidth
            >
              {t('common:auth.passwordReset.forgot')}
            </Button>
          </Box>

          <Button
            variant="contained"
            fullWidth
            loading={loading}
            disabled={!password || !captchaToken}
            onClick={submitSignIn}
          >
            {t('common:auth.signIn')}
          </Button>
        </>
      )}

      <Button onClick={onReturn}>{t('common:actions.back')}</Button>
    </>
  )
}

export default LoginSignInStep
