import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { QRCodeCanvas } from 'qrcode.react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MdCheckCircle as CheckCircleIcon } from 'react-icons/md'

import { authClient } from '@/auth/betterAuth'
import { notify } from '@/context/notification/notify'
import PasswordField from '@/pages/common/auth/PasswordField'

import BackupCodes from './BackupCodes'

interface TwoFactorSectionProps {
  enabled: boolean
  onStatusChange: () => Promise<unknown>
}

type ProtectedTwoFactorAction = 'disable' | 'regenerateBackupCodes'

const getTotpSecret = (totpURI: string) => {
  try {
    return new URL(totpURI).searchParams.get('secret') ?? ''
  } catch {
    return ''
  }
}

const TwoFactorSection = ({
  enabled,
  onStatusChange,
}: TwoFactorSectionProps) => {
  const { t } = useTranslation()
  const [code, setCode] = useState('')
  const [totpURI, setTotpURI] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [password, setPassword] = useState('')
  const [requiresPassword, setRequiresPassword] = useState(false)
  const [protectedAction, setProtectedAction] =
    useState<ProtectedTwoFactorAction | null>(null)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [recoveryCodesConfirmed, setRecoveryCodesConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [setupDialogOpen, setSetupDialogOpen] = useState(false)
  const setupKey = getTotpSecret(totpURI)

  const clearSetup = (preserveBackupCodes = false) => {
    setCode('')
    setRecoveryCodesConfirmed(false)
    setTotpURI('')
    setPassword('')
    setRequiresPassword(false)
    if (!preserveBackupCodes) {
      setBackupCodes([])
    }
  }

  const handleEnable = async () => {
    if (requiresPassword && !password) {
      return
    }

    setLoading(true)

    try {
      const { data, error } = await authClient.twoFactor.enable({
        password: requiresPassword ? password : undefined,
      })

      if (error) {
        notify.error(error.message)
        return
      }

      setTotpURI(data.totpURI)
      setBackupCodes(data.backupCodes)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!code) {
      return
    }

    setLoading(true)

    try {
      const { error } = await authClient.twoFactor.verifyTotp({
        code,
        trustDevice: true,
      })

      if (error) {
        notify.error(error.message)
        return
      }

      clearSetup(true)
      setSetupDialogOpen(false)
      await onStatusChange()
      notify.success(t('common:profile.twoFactor.enabledSuccess'))
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async (passwordValue?: string) => {
    setLoading(true)

    try {
      const { error } = await authClient.twoFactor.disable({
        password: passwordValue,
      })

      if (error) {
        notify.error(error.message)
        return
      }

      clearSetup()
      setPasswordDialogOpen(false)
      setProtectedAction(null)
      await onStatusChange()
      notify.success(t('common:profile.twoFactor.disabledSuccess'))
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerateBackupCodes = async (passwordValue?: string) => {
    setLoading(true)

    try {
      const { data, error } = await authClient.twoFactor.generateBackupCodes({
        password: passwordValue,
      })

      if (error) {
        notify.error(error.message)
        return
      }

      setBackupCodes(data.backupCodes)
      setPasswordDialogOpen(false)
      setProtectedAction(null)
      setPassword('')
      notify.success(t('common:profile.twoFactor.backupCodesGenerated'))
    } finally {
      setLoading(false)
    }
  }

  const handleOpenProtectedAction = async (
    action: ProtectedTwoFactorAction
  ) => {
    setLoading(true)

    try {
      const { data, error } = await authClient.listAccounts()

      if (error) {
        notify.error(error.message)
        return
      }

      const needsPassword = data.some(
        (account) => account.providerId === 'credential'
      )
      setRequiresPassword(needsPassword)
      setProtectedAction(action)

      if (needsPassword) {
        setPasswordDialogOpen(true)
        return
      }

      if (action === 'disable') {
        await handleDisable()
      } else {
        await handleRegenerateBackupCodes()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmProtectedAction = async () => {
    if (!protectedAction || (requiresPassword && !password)) {
      return
    }

    if (protectedAction === 'disable') {
      await handleDisable(password)
    } else {
      await handleRegenerateBackupCodes(password)
    }
  }

  const handleClosePasswordDialog = () => {
    if (!loading) {
      setPasswordDialogOpen(false)
      setProtectedAction(null)
      setPassword('')
    }
  }

  const handleCloseSetupDialog = () => {
    if (!loading) {
      setSetupDialogOpen(false)
      clearSetup()
    }
  }

  const handleOpenSetupDialog = async () => {
    setLoading(true)

    try {
      const { data, error } = await authClient.listAccounts()

      if (error) {
        notify.error(error.message)
        return
      }

      setRequiresPassword(
        data.some((account) => account.providerId === 'credential')
      )
      setSetupDialogOpen(true)
    } finally {
      setLoading(false)
    }
  }

  const handleCopySetupKey = async () => {
    if (!setupKey) {
      return
    }

    try {
      await navigator.clipboard.writeText(setupKey)
      notify.success(t('common:profile.twoFactor.setupKeyCopied'))
    } catch {
      notify.error(t('common:profile.twoFactor.setupKeyCopyFailed'))
    }
  }

  return (
    <Stack spacing={2} sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ textAlign: 'center' }}>
        {t('common:profile.twoFactor.title')}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textAlign: 'center' }}
      >
        {t('common:profile.twoFactor.description')}
      </Typography>

      <Chip
        icon={enabled ? <CheckCircleIcon /> : undefined}
        label={
          enabled
            ? t('common:profile.twoFactor.enabled')
            : t('common:profile.twoFactor.disabled')
        }
        color={enabled ? 'success' : 'warning'}
        size="small"
      />

      {!enabled && (
        <Button
          variant="outlined"
          onClick={() => void handleOpenSetupDialog()}
          loading={loading}
        >
          {t('common:profile.twoFactor.enable')}
        </Button>
      )}
      {enabled && (
        <>
          <Button
            variant="contained"
            onClick={() =>
              void handleOpenProtectedAction('regenerateBackupCodes')
            }
            loading={loading}
          >
            {t('common:profile.twoFactor.regenerateBackupCodes')}
          </Button>

          <Button
            color="warning"
            variant="outlined"
            onClick={() => void handleOpenProtectedAction('disable')}
            loading={loading}
          >
            {t('common:profile.twoFactor.disable')}
          </Button>

          <BackupCodes codes={backupCodes} />
        </>
      )}

      <Dialog
        open={passwordDialogOpen}
        onClose={handleClosePasswordDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t('common:profile.twoFactor.password')}</DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          <PasswordField
            password={password}
            setPassword={setPassword}
            label={t('common:profile.twoFactor.password')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog} disabled={loading}>
            {t('common:actions.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleConfirmProtectedAction()}
            loading={loading}
            disabled={!password}
          >
            {t('common:actions.continue')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={setupDialogOpen}
        onClose={handleCloseSetupDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t('common:profile.twoFactor.enable')}</DialogTitle>
        <DialogContent>
          {totpURI ? (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography variant="body2">
                {t('common:profile.twoFactor.scanQr')}
              </Typography>

              <Button
                component="a"
                href={totpURI}
                variant="outlined"
                sx={{ display: { xs: 'inline-flex', md: 'none' } }}
              >
                {t('common:profile.twoFactor.openAuthenticator')}
              </Button>

              <Box
                sx={{
                  '& canvas': {
                    display: 'block',
                    height: 'auto !important',
                    margin: '0 auto',
                    maxWidth: '100%',
                    width: '100% !important',
                  },
                }}
              >
                <QRCodeCanvas value={totpURI} size={400} marginSize={4} />
              </Box>

              {setupKey && (
                <Stack spacing={1}>
                  <Typography variant="body2">
                    {t('common:profile.twoFactor.manualSetup')}
                  </Typography>
                  <TextField
                    value={setupKey}
                    fullWidth
                    size="small"
                    slotProps={{ input: { readOnly: true } }}
                  />
                  <Button
                    variant="outlined"
                    onClick={() => void handleCopySetupKey()}
                  >
                    {t('common:profile.twoFactor.copySetupKey')}
                  </Button>
                </Stack>
              )}

              <TextField
                label={t('common:profile.twoFactor.code')}
                value={code}
                onChange={(event) => setCode(event.target.value)}
                slotProps={{
                  htmlInput: { inputMode: 'numeric', maxLength: 8 },
                }}
                fullWidth
              />

              <BackupCodes codes={backupCodes} />

              {backupCodes.length > 0 && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={recoveryCodesConfirmed}
                      onChange={(event) =>
                        setRecoveryCodesConfirmed(event.target.checked)
                      }
                    />
                  }
                  label={t('common:profile.twoFactor.recoveryCodesDownloaded')}
                />
              )}
            </Stack>
          ) : (
            <Typography variant="body2">
              {t('common:profile.twoFactor.enableDescription')}
            </Typography>
          )}

          {!totpURI && requiresPassword && (
            <PasswordField
              password={password}
              setPassword={setPassword}
              label={t('common:profile.twoFactor.password')}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSetupDialog} disabled={loading}>
            {t('common:actions.cancel')}
          </Button>
          {totpURI ? (
            <Button
              variant="contained"
              onClick={() => void handleVerify()}
              loading={loading}
              disabled={
                !code || !recoveryCodesConfirmed || backupCodes.length === 0
              }
            >
              {t('common:profile.twoFactor.verify')}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={() => void handleEnable()}
              loading={loading}
            >
              {t('common:profile.twoFactor.enable')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

export default TwoFactorSection
