import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState, type Dispatch, type SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { authError } from '@/auth/authError'
import { authClient } from '@/auth/betterAuth'
import { notify } from '@/context/notification/notify'
import Captcha from '@/pages/common/auth/Captcha'
import PasswordField from '@/pages/common/auth/PasswordField'

interface ILoginSignUpStep {
  email: string
  password: string
  setPassword: Dispatch<SetStateAction<string>>
  onReturn: () => void
  loading: boolean
  setLoading: Dispatch<SetStateAction<boolean>>
  captchaToken: string
  setCaptchaToken: Dispatch<SetStateAction<string>>
}

const LoginSignUpStep = ({
  email,
  password,
  setPassword,
  onReturn,
  loading,
  setLoading,
  captchaToken,
  setCaptchaToken,
}: ILoginSignUpStep) => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')

  const submitSignUp = async () => {
    if (!name.trim() || !email || !password) {
      return
    }

    if (password !== passwordConfirmation) {
      notify.error(t('common:validation.passwordsDoNotMatch'))
      return
    }

    setLoading(true)

    const { error } = await authClient.signUp.email(
      {
        name: name.trim(),
        email,
        password,
        locale: i18n.language,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        callbackURL: '/menu',
      },
      { headers: { 'x-captcha-response': captchaToken } }
    )

    setLoading(false)

    if (error) {
      setCaptchaToken('')
      return authError(error)
    }

    void navigate('/confirm-email', {
      state: { email, password },
    })
  }

  return (
    <>
      <Typography variant="h6">
        {t('common:auth.registration.title')}
      </Typography>

      <TextField
        label={t('common:fields.firstName')}
        value={name}
        onChange={(e) => {
          setName(e.target.value)
        }}
        autoComplete="name"
        fullWidth
        autoFocus
      />

      <TextField label="Email" value={email} fullWidth disabled />

      <PasswordField
        password={password}
        setPassword={setPassword}
        autocomplete="new-password"
      />

      <PasswordField
        label={t('common:fields.repeatPassword')}
        password={passwordConfirmation}
        setPassword={setPasswordConfirmation}
        autocomplete="new-password"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            void submitSignUp()
          }
        }}
      />
      <Captcha captchaToken={captchaToken} setCaptchaToken={setCaptchaToken} />

      <Button
        variant="contained"
        fullWidth
        loading={loading}
        disabled={
          !name.trim() || !password || !passwordConfirmation || !captchaToken
        }
        onClick={submitSignUp}
      >
        {t('common:auth.registration.submit')}
      </Button>
      <Button onClick={onReturn}>{t('common:actions.back')}</Button>
    </>
  )
}

export default LoginSignUpStep
