import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grow from '@mui/material/Grow'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  MdEmail as EmailIcon,
  MdMarkEmailRead as MarkEmailReadIcon,
} from 'react-icons/md'
import { Navigate, useLocation } from 'react-router-dom'
import { io } from 'socket.io-client'

import { authClient } from '@/auth/betterAuth'
import { baseWSURL } from '@/config'
import BackToLoginButton from '@/pages/common/auth/BackToLoginButton'
import { getEmailConfirmationState } from '@/pages/common/auth/emailConfirmationState'

const ConfirmEmail = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const { data } = authClient.useSession()

  const confirmationState = getEmailConfirmationState(location.state)
  const email = confirmationState?.email
  const password = confirmationState?.password

  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(false)
  const isCompletingSignIn = useRef(false)

  useEffect(() => {
    let socket: ReturnType<typeof io> | undefined

    if (email && password) {
      socket = io(baseWSURL, {
        path: '/ws',
        transports: ['websocket'],
        auth: {
          type: 'email-verification',
          email,
          password,
        },
      })

      const completeSignIn = async ({ ticket }: { ticket: string }) => {
        if (isCompletingSignIn.current) {
          return
        }

        isCompletingSignIn.current = true
        try {
          const completeEmailVerificationURL = new URL(
            '/api/auth/complete-email-verification',
            baseWSURL || globalThis.location.origin
          )
          const response = await fetch(completeEmailVerificationURL, {
            method: 'POST',
            credentials: 'include',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ ticket }),
          })

          if (response.ok) {
            globalThis.location.assign('/menu')
          }
        } finally {
          isCompletingSignIn.current = false
        }
      }

      socket.on('email-verified', completeSignIn)
    }

    return () => {
      socket?.disconnect()
    }
  }, [email, password])

  if (data?.user) {
    return <Navigate to="/menu" replace />
  }

  const handleResend = async () => {
    if (!email || sending) {
      return
    }

    setSending(true)
    setSent(false)
    setError(false)

    const { error: e } = await authClient.sendVerificationEmail({
      email,
      callbackURL: '/menu',
    })

    setSending(false)

    if (e) {
      setError(true)
      return
    }

    setSent(true)
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
          <MarkEmailReadIcon size={64} style={{ marginBottom: 16 }} />

          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            {t('common:auth.emailConfirmation.title')}
          </Typography>

          {email ? (
            <Paper variant="outlined" sx={{ py: 2, px: 0.5 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: `${Math.max(0.75, Math.min(1.5, 30 / email.length))}rem`,
                }}
              >
                {email}
              </Typography>
            </Paper>
          ) : null}

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mt: 2,
              lineHeight: 1.7,
            }}
          >
            {t('common:auth.emailConfirmation.sent')}
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mt: 1,
              lineHeight: 1.7,
            }}
          >
            {t('common:auth.emailConfirmation.instructions')}
          </Typography>

          <Paper
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 2,
            }}
            variant="outlined"
          >
            <Typography variant="body2" color="text.secondary">
              {t('common:auth.emailConfirmation.resendHint')}
            </Typography>
          </Paper>

          <Button
            variant="contained"
            size="large"
            onClick={handleResend}
            disabled={!email || sending}
            fullWidth
            startIcon={<EmailIcon />}
            sx={{
              mt: 2,
            }}
          >
            {sending
              ? t('common:status.sending')
              : t('common:auth.emailConfirmation.resend')}
          </Button>

          {sent && (
            <Alert severity="success">
              {t('common:auth.emailConfirmation.resent')}
            </Alert>
          )}

          {error && (
            <Alert security="warning">
              {t('common:auth.emailConfirmation.resendFailed')}
            </Alert>
          )}

          <BackToLoginButton />
        </Paper>
      </Box>
    </Grow>
  )
}

export default ConfirmEmail
