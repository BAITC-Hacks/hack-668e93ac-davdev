import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grow from '@mui/material/Grow'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  MdLockReset as LockResetIcon,
  MdPassword as PasswordIcon,
} from 'react-icons/md'
import { useLocation } from 'react-router-dom'

import { authClient } from '@/auth/betterAuth'
import BackToLoginButton from '@/pages/common/auth/BackToLoginButton'
import { getState } from '@/utils/getState'

const ForgotPassword = () => {
  const location = useLocation()
  const { t } = useTranslation()

  const email = getState(location.state)

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (loading || !email) {
      return
    }

    setError('')

    setLoading(true)

    const { error: e } = await authClient.requestPasswordReset({
      email,
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
              {t('common:auth.passwordReset.linkSent')}
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mt: 2,
                lineHeight: 1.7,
              }}
            >
              {t('common:auth.passwordReset.followLink')}
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
          <PasswordIcon size={64} style={{ marginBottom: 16 }} />

          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            {t('common:auth.passwordReset.forgot')}
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mt: 1,
              lineHeight: 1.7,
            }}
          >
            {t('common:auth.passwordReset.requestDescription')}
          </Typography>

          {email ? (
            <Paper variant="outlined" sx={{ py: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {email}
              </Typography>
            </Paper>
          ) : null}

          {error && (
            <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
              {error}
            </Alert>
          )}

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleSubmit}
            disabled={loading}
            startIcon={<LockResetIcon />}
            sx={{ mt: 2 }}
          >
            {loading
              ? t('common:status.sending')
              : t('common:auth.passwordReset.request')}
          </Button>

          <BackToLoginButton />
        </Paper>
      </Box>
    </Grow>
  )
}

export default ForgotPassword
