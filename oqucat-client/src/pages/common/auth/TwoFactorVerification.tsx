import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grow from '@mui/material/Grow'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { authClient } from '@/auth/betterAuth'
import CodeSlots, {
  type CodeSlotsStatus,
} from '@/components/react-bits/CodeSlots'
import { notify } from '@/context/notification/notify'
import BackToLoginButton from '@/pages/common/auth/BackToLoginButton'
import { useThemeColors } from '@/utils/useThemeColors'

const TwoFactorVerification = () => {
  const { t } = useTranslation()
  const c = useThemeColors()
  const navigate = useNavigate()

  const [backupCode, setBackupCode] = useState('')
  const [status, setStatus] = useState<CodeSlotsStatus>('idle')
  const [isBackup, setIsBackup] = useState(false)
  const [trustDevice, setTrustDevice] = useState(true)
  const [loading, setLoading] = useState(false)

  const handleVerify = async (codeToVerify = backupCode) => {
    if (!codeToVerify) {
      return
    }

    setLoading(true)

    try {
      const result = isBackup
        ? await authClient.twoFactor.verifyBackupCode({
            code: codeToVerify,
            trustDevice,
          })
        : await authClient.twoFactor.verifyTotp({
            code: codeToVerify,
            trustDevice,
          })

      if (result.error) {
        notify.error(result.error.message)
        setStatus('error')

        setTimeout(() => {
          setStatus('idle')
        }, 500)

        return
      }
      setStatus('success')
      void navigate('/menu', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Grow in>
      <Paper
        elevation={5}
        sx={{
          p: 3,
          my: 2,
          width: { xs: 1, sm: 400 },
          margin: 'auto',
        }}
      >
        <Stack spacing={2}>
          <Typography variant="h6">
            {t('common:profile.twoFactor.title')}
          </Typography>

          {isBackup ? (
            <TextField
              label={t('common:profile.twoFactor.code')}
              value={backupCode}
              onChange={(event) => setBackupCode(event.target.value)}
              autoFocus
              fullWidth
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  void handleVerify()
                }
              }}
            />
          ) : (
            <CodeSlots
              mask
              onComplete={handleVerify}
              accentColor={c.primary}
              inkColor={c.text}
              slotColor={c.divider}
              digitColor={c.contrastText}
              dangerColor={c.error}
              className="w-full [&>div]:w-full [&>div>[data-code-slot]]:w-auto [&>div>[data-code-slot]]:flex-1"
              status={status}
            />
          )}

          <FormControlLabel
            control={
              <Checkbox
                checked={trustDevice}
                onChange={(event) => setTrustDevice(event.target.checked)}
              />
            }
            label={t('common:profile.twoFactor.trustDevice')}
          />

          {isBackup && (
            <Button
              variant="contained"
              onClick={() => void handleVerify()}
              loading={loading}
              disabled={!backupCode}
            >
              {t('common:profile.twoFactor.verify')}
            </Button>
          )}

          <Button
            variant="outlined"
            onClick={() => {
              setIsBackup((value) => !value)
              setBackupCode('')
            }}
          >
            {isBackup
              ? t('common:profile.twoFactor.useAuthenticatorCode')
              : t('common:profile.twoFactor.useBackupCode')}
          </Button>

          <BackToLoginButton />
        </Stack>
      </Paper>
    </Grow>
  )
}

export default TwoFactorVerification
