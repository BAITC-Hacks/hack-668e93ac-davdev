import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grow from '@mui/material/Grow'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MdLockReset as LockResetIcon } from 'react-icons/md'
import { useSearchParams } from 'react-router-dom'

import { authClient } from '@/auth/betterAuth'
import BackToLoginButton from '@/pages/common/auth/BackToLoginButton'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const { t } = useTranslation()

  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (loading) {
      return
    }

    setError('')

    if (!token) {
      setError(t('common:auth.passwordReset.invalidLink'))
      return
    }

    if (!password || !confirmPassword) {
      setError(t('common:validation.fillBothFields'))
      return
    }

    if (password.length < 8) {
      setError(t('common:validation.passwordMinLength'))
      return
    }

    if (password !== confirmPassword) {
      setError(t('common:validation.passwordsDoNotMatch'))
      return
    }

    setLoading(true)

    const { error: e } = await authClient.resetPassword({
      newPassword: password,
      token,
    })

    setLoading(false)

    if (e) {
      setError(e.message ?? t('common:auth.passwordReset.changeFailed'))
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <Grow in>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              width: '100%',
              maxWidth: 520,
              p: { xs: 3, sm: 5 },
              textAlign: 'center',
              borderRadius: 3,
            }}
          >
            <LockResetIcon size={64} style={{ marginBottom: 16 }} />

            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 700 }}
            >
              {t('common:auth.passwordReset.changedTitle')}
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mt: 2,
                lineHeight: 1.7,
              }}
            >
              {t('common:auth.passwordReset.changedDescription')}
            </Typography>

            <BackToLoginButton />
          </Paper>
        </Box>
      </Grow>
    )
  }

  return (
    <Grow in>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            width: '100%',
            maxWidth: 520,
            p: { xs: 3, sm: 5 },
            textAlign: 'center',
            borderRadius: 3,
          }}
        >
          <LockResetIcon size={64} style={{ marginBottom: 16 }} />

          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            {t('common:auth.passwordReset.title')}
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mt: 1,
              mb: 3,
              lineHeight: 1.7,
            }}
          >
            {t('common:auth.passwordReset.newPasswordPrompt')}
          </Typography>

          {!token && (
            <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
              {t('common:auth.passwordReset.invalidLink')}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            type="password"
            label={t('common:fields.newPassword')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading || !token}
            autoComplete="new-password"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            type="password"
            label={t('common:fields.repeatNewPassword')}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading || !token}
            autoComplete="new-password"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                void handleSubmit()
              }
            }}
          />

          <Paper
            variant="outlined"
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 2,
              textAlign: 'left',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {t('common:validation.passwordMinLength')}
            </Typography>
          </Paper>

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleSubmit}
            disabled={!token || loading}
            startIcon={<LockResetIcon />}
            sx={{ mt: 2 }}
          >
            {loading
              ? t('common:auth.passwordReset.changing')
              : t('common:profile.password.editTitle')}
          </Button>

          <BackToLoginButton />
        </Paper>
      </Box>
    </Grow>
  )
}

export default ResetPassword
