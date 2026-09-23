import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import type { Dispatch, SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'

import { checkEmail } from '@/api/http/auth'
import Captcha from '@/pages/common/auth/Captcha'
import RecentAccountsControl from '@/pages/common/auth/RecentAccountsControl'
import GoogleButton from '@/pages/common/auth/widgets/GoogleButton'
import {
  FacebookButton,
  GithubButton,
} from '@/pages/common/auth/widgets/OAuthButton'
import PasskeyButton from '@/pages/common/auth/widgets/PasskeyButton'
import TelegramLoginButton from '@/pages/common/auth/widgets/TelegramLoginButton'
import type { EmailCheckStatus } from '@/types/EmailCheckResult'

interface ILoginEmailStep {
  email: string
  setEmail: Dispatch<SetStateAction<string>>
  loading: boolean
  setLoading: Dispatch<SetStateAction<boolean>>
  onResult: (result: EmailCheckStatus) => void

  setPassword: Dispatch<SetStateAction<string>>
  captchaToken: string
  setCaptchaToken: Dispatch<SetStateAction<string>>
}

const LoginEmailStep = ({
  email,
  setEmail,
  loading,
  setLoading,
  onResult,
  setPassword,
  captchaToken,
  setCaptchaToken,
}: ILoginEmailStep) => {
  const { t } = useTranslation()

  const continueWithEmail = async (acEmail?: string) => {
    let mailToSend
    if (acEmail === undefined) {
      mailToSend = email
    } else {
      mailToSend = acEmail
      setEmail(acEmail)
    }

    const normalizedEmail = mailToSend.trim().toLowerCase()

    if (!normalizedEmail) {
      return
    }

    setLoading(true)

    try {
      const result = await checkEmail(normalizedEmail, captchaToken)

      if (!result) {
        return
      }

      setEmail(normalizedEmail)

      onResult(result)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Captcha captchaToken={captchaToken} setCaptchaToken={setCaptchaToken} />
      <Stack
        direction="row"
        spacing={1}
        sx={{
          justifyContent: 'space-evenly',
        }}
      >
        <GoogleButton />
        <TelegramLoginButton />
        <GithubButton />
        {/* <MicrosoftButton /> */}
        <FacebookButton />
        <PasskeyButton />
      </Stack>
      <Divider>{t('common:labels.or')}</Divider>
      {/* <Typography variant="h6">{t('common:auth.signIn')}</Typography> */}

      <RecentAccountsControl
        onRecentClick={(accountEmail) => {
          void continueWithEmail(accountEmail)
        }}
      />

      {/* TODO After auto password capture, if a user enters an email, empty the password field */}
      <TextField
        label="Email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
        }}
        type="email"
        autoComplete="email"
        fullWidth
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            void continueWithEmail()
          }
        }}
      />

      <input
        type="password"
        hidden
        onChange={(e) => {
          setPassword(e.target.value)
        }}
      />

      <Button
        variant="contained"
        fullWidth
        loading={loading}
        disabled={!email}
        onClick={() => void continueWithEmail()}
      >
        {t('common:actions.continue')}
      </Button>
    </>
  )
}

export default LoginEmailStep
