import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Grow from '@mui/material/Grow'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { alpha } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { Image } from 'mui-image'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, Link as RRLink } from 'react-router-dom'

import { authClient } from '@/auth/betterAuth'
import LangChip from '@/components/i18n/LangChip'
import Aurora from '@/components/react-bits/Aurora'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import type { EmailCheckStatus } from '@/types/EmailCheckResult'
import { useThemeColors } from '@/utils/useThemeColors'

import Captcha from './Captcha'
import LoginEmailStep from './steps/LoginEmailStep'
import LoginSignInStep from './steps/LoginSignInStep'
import LoginSignUpStep from './steps/LoginSignUpStep'

type Step = 'captcha' | 'email' | 'signin' | 'signup'

const Login = () => {
  const { t } = useTranslation()
  const colors = useThemeColors()
  const auroraColors = useMemo(
    () => [colors.primary, colors.primaryLight, colors.secondary],
    [colors.primary, colors.primaryLight, colors.secondary]
  )
  const { data, isPending } = authClient.useSession()
  const user = data?.user

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [step, setStep] = useState<Step>('captcha')
  const [status, setStatus] = useState<EmailCheckStatus | null>(null)

  const [loading, setLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')

  const onCaptchaSuccess = () => {
    setStep('email')
  }

  const onEmailResult = (result: EmailCheckStatus) => {
    if (result.length > 0) {
      setStep('signin')
      setStatus(result)
    } else {
      setStep('signup')
    }
  }

  const onReturn = () => {
    setStep('captcha')
    setStatus(null)
    setPassword('')
    setCaptchaToken('')
  }

  if (user) {
    return <Navigate to="/menu" replace />
  }

  return (
    <Grow in={!isPending}>
      <Box
        sx={{
          position: 'relative',
          isolation: 'isolate',
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: colors.background,
        }}
      >
        <Box
          aria-hidden="true"
          sx={{ position: 'absolute', inset: 0, zIndex: 0 }}
        >
          <Aurora
            colorStops={auroraColors}
            amplitude={5}
            blend={0.5}
            lightMode={colors.background === '#fff'}
          />
        </Box>

        <Paper
          sx={{
            p: 3,
            width: { xs: 1, sm: 400 },
            position: 'relative',
            zIndex: 1,
            margin: 'auto',
            overflow: 'hidden',
            backgroundColor: alpha(colors.background, 0.9),
          }}
        >
          <ThemeSwitcher />
          <Box sx={{ my: 1 }} />
          <LangChip />

          <Stack spacing={2} sx={{ alignItems: 'center', mt: 2 }}>
            <RRLink to="/">
              <Image
                src="/logo.svg"
                width={200}
                duration={325}
                style={{
                  filter:
                    colors.foreground === '#fff'
                      ? 'brightness(0) invert(1)'
                      : 'none',
                }}
              />
              {/* <Image src="/app-icon.png" width={200} duration={325} /> */}
            </RRLink>

            <Divider sx={{ width: 1 }} />

            <Stack sx={{ width: 1 }} spacing={1}>
              {step === 'captcha' && (
                <Captcha
                  captchaToken={captchaToken}
                  setCaptchaToken={setCaptchaToken}
                  onSuccess={onCaptchaSuccess}
                />
              )}
              {step === 'email' && (
                <LoginEmailStep
                  email={email}
                  setEmail={setEmail}
                  loading={loading}
                  setLoading={setLoading}
                  onResult={onEmailResult}
                  setPassword={setPassword}
                  captchaToken={captchaToken}
                  setCaptchaToken={setCaptchaToken}
                />
              )}

              {step === 'signin' && status && (
                <LoginSignInStep
                  email={email}
                  password={password}
                  setPassword={setPassword}
                  loading={loading}
                  setLoading={setLoading}
                  onReturn={onReturn}
                  status={status}
                  captchaToken={captchaToken}
                  setCaptchaToken={setCaptchaToken}
                />
              )}

              {step === 'signup' && (
                <LoginSignUpStep
                  email={email}
                  password={password}
                  setPassword={setPassword}
                  loading={loading}
                  setLoading={setLoading}
                  onReturn={onReturn}
                  captchaToken={captchaToken}
                  setCaptchaToken={setCaptchaToken}
                />
              )}
              <Divider />
              <Typography variant="caption" sx={{ textAlign: 'center' }}>
                {t('common:auth.termsNotice')}{' '}
                <Link href="/PrivacyPolicy.doc">
                  {t('common:auth.privacyPolicy')}
                </Link>
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </Grow>
  )
}

export default Login
