import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FaFacebook as FacebookIcon,
  FaGithub as GitHubIcon,
  FaGoogle as GoogleIcon,
  FaTelegram as TelegramIcon,
} from 'react-icons/fa6'
import { MdKey as KeyIcon, MdLinkOff as LinkOffIcon } from 'react-icons/md'

import { authError } from '@/auth/authError'
import { authClient, useAuthSession } from '@/auth/betterAuth'
import { cloudflareSiteKey } from '@/config'
import { notify } from '@/context/notification/notify'
import Captcha from '@/pages/common/auth/Captcha'
import PasswordField from '@/pages/common/auth/PasswordField'

type ProviderId =
  | 'credential'
  | 'google'
  | 'github'
  | 'microsoft'
  | 'facebook'
  | 'telegram-oidc'

interface AuthAccount {
  accountId: string
  providerId: ProviderId
}

interface ProviderCard {
  id: ProviderId
  icon: ReactNode
}

type PasswordDialogMode = 'change'

const providerCards: ProviderCard[] = [
  { id: 'credential', icon: <KeyIcon /> },
  { id: 'google', icon: <GoogleIcon /> },
  { id: 'github', icon: <GitHubIcon /> },
  // { id: 'microsoft', icon: <MicrosoftIcon /> },
  { id: 'facebook', icon: <FacebookIcon /> },
  { id: 'telegram-oidc', icon: <TelegramIcon /> },
]

const isProviderId = (value: string): value is ProviderId =>
  providerCards.some(({ id }) => id === value)

const ConnectedAccountsSection = () => {
  const { t } = useTranslation()
  const { data: session } = useAuthSession()
  const [accounts, setAccounts] = useState<AuthAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAccount, setSelectedAccount] = useState<AuthAccount | null>(
    null
  )
  const [unlinking, setUnlinking] = useState(false)
  const [passwordCreationOpen, setPasswordCreationOpen] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')
  const [passwordDialogMode, setPasswordDialogMode] =
    useState<PasswordDialogMode | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [bindingPassword, setBindingPassword] = useState(false)
  const loadAccounts = useCallback(async () => {
    const { data, error } = await authClient.listAccounts()

    if (error) {
      return authError(error)
    }

    setAccounts(
      data
        .filter(
          (account): account is typeof account & { providerId: ProviderId } =>
            isProviderId(account.providerId)
        )
        .map(({ accountId, providerId }) => ({ accountId, providerId }))
    )
    setTimeout(() => setLoading(false), 0)
  }, [])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    void loadAccounts()
  }, [loadAccounts])

  const handleBind = async (providerId: ProviderId) => {
    if (providerId === 'credential') {
      setPasswordCreationOpen(true)
      return
    }

    const { error } = await authClient.linkSocial({
      provider: providerId,
      callbackURL: '/menu?tab=profile',
      errorCallbackURL: `/error?type=${providerId}`,
    })

    if (error) {
      return authError(error)
    }
  }

  const handleSendPasswordCreationLink = async () => {
    const email = session?.user?.email

    if (!email) {
      notify.error(t('common:auth.passwordReset.changeFailed'))
      return
    }

    if (cloudflareSiteKey && !captchaToken) {
      return
    }

    setBindingPassword(true)

    try {
      const { error } = await authClient.requestPasswordReset(
        {
          email,
          redirectTo: '/reset-password',
        },
        { headers: { 'x-captcha-response': captchaToken } }
      )

      if (error) {
        setCaptchaToken('')
        return authError(error)
      }

      setPasswordCreationOpen(false)
      setCaptchaToken('')
      notify.success(t('common:auth.passwordReset.linkSent'))
    } finally {
      setBindingPassword(false)
    }
  }

  const handleConfirmUnlink = async () => {
    if (!selectedAccount) {
      return
    }

    setUnlinking(true)

    try {
      const { error } = await authClient.unlinkAccount({
        providerId: selectedAccount.providerId,
        accountId: selectedAccount.accountId,
      })

      if (error) {
        return authError(error)
      }

      await loadAccounts()
      setSelectedAccount(null)
      notify.success(t('common:profile.accounts.unlinked'))
    } finally {
      setUnlinking(false)
    }
  }

  const handleBindPassword = async () => {
    if (!password || !passwordConfirmation) {
      return
    }

    if (password !== passwordConfirmation) {
      notify.error(t('common:validation.passwordsDoNotMatch'))
      return
    }

    if (!currentPassword) {
      notify.error(t('common:validation.currentPasswordRequired'))
      return
    }

    setBindingPassword(true)

    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword: password,
        revokeOtherSessions: true,
      })

      if (error) {
        return authError(error)
      }

      setPassword('')
      setCurrentPassword('')
      setPasswordConfirmation('')
      setPasswordDialogMode(null)
      await loadAccounts()
      notify.success(t('common:profile.accounts.passwordChanged'))
    } finally {
      setBindingPassword(false)
    }
  }

  if (loading) {
    return null
  }

  return (
    <Stack spacing={1} sx={{ gridColumn: '1 / -1' }}>
      <Typography variant="subtitle2" sx={{ textAlign: 'center' }}>
        {t('common:profile.accounts.title')}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ textAlign: 'center' }}
      >
        {t('common:profile.accounts.description')}
      </Typography>
      <Grid
        container
        sx={{
          display: 'grid',
          gap: 1,
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(3, minmax(0, 1fr))',
          },
        }}
      >
        {providerCards.map((provider) => {
          const account = accounts.find(
            ({ providerId }) => providerId === provider.id
          )
          const connected = Boolean(account)

          return (
            <Grid key={provider.id} sx={{ minWidth: 0 }}>
              <Paper
                variant="outlined"
                sx={{
                  borderColor: connected ? 'success.main' : 'error.main',
                  minWidth: 0,
                }}
              >
                <Button
                  fullWidth
                  color={connected ? 'success' : 'error'}
                  startIcon={provider.icon}
                  endIcon={connected ? <LinkOffIcon /> : undefined}
                  onClick={() => {
                    if (account?.providerId === 'credential') {
                      setPasswordDialogMode('change')
                    } else if (account) {
                      setSelectedAccount(account)
                    } else {
                      void handleBind(provider.id)
                    }
                  }}
                  sx={{
                    justifyContent: 'flex-start',
                    minHeight: 76,
                    px: 1,
                    textTransform: 'none',
                  }}
                >
                  <Stack sx={{ alignItems: 'flex-start', flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {t(`common:profile.accounts.providers.${provider.id}`)}
                    </Typography>
                    <Chip
                      label={t(
                        connected
                          ? 'common:profile.accounts.connected'
                          : 'common:profile.accounts.notConnected'
                      )}
                      color={connected ? 'success' : 'error'}
                      size="small"
                    />
                  </Stack>
                </Button>
              </Paper>
            </Grid>
          )
        })}
      </Grid>

      <Dialog
        open={passwordCreationOpen}
        onClose={() => {
          if (!bindingPassword) {
            setPasswordCreationOpen(false)
            setCaptchaToken('')
          }
        }}
      >
        <DialogTitle>
          {t('common:profile.accounts.passwordCreationTitle')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {t('common:profile.accounts.passwordCreationDescription')}
            </Typography>
            <Captcha
              captchaToken={captchaToken}
              setCaptchaToken={setCaptchaToken}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setPasswordCreationOpen(false)
              setCaptchaToken('')
            }}
            disabled={bindingPassword}
          >
            {t('common:actions.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleSendPasswordCreationLink()}
            loading={bindingPassword}
            disabled={Boolean(cloudflareSiteKey) && !captchaToken}
          >
            {t('common:profile.accounts.sendPasswordCreationLink')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={selectedAccount !== null}
        onClose={() => {
          if (!unlinking) {
            setSelectedAccount(null)
          }
        }}
      >
        <DialogTitle>{t('common:profile.accounts.unlinkTitle')}</DialogTitle>
        <DialogContent>
          {t('common:profile.accounts.unlinkConfirmation')}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedAccount(null)} disabled={unlinking}>
            {t('common:actions.cancel')}
          </Button>
          <Button
            color="warning"
            onClick={() => void handleConfirmUnlink()}
            loading={unlinking}
          >
            {t('common:actions.unlink')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={passwordDialogMode !== null}
        onClose={() => {
          if (!bindingPassword) {
            setPasswordDialogMode(null)
            setCurrentPassword('')
            setPassword('')
            setPasswordConfirmation('')
          }
        }}
      >
        <DialogTitle>{t('common:profile.accounts.changePassword')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {t('common:profile.accounts.changePasswordDescription')}
            </Typography>
            <PasswordField
              password={currentPassword}
              setPassword={setCurrentPassword}
              autocomplete="current-password"
              label={t('common:fields.currentPassword')}
            />
            <PasswordField
              password={password}
              setPassword={setPassword}
              autocomplete="new-password"
              label={t('common:fields.newPassword')}
              autoFocus
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  void handleBindPassword()
                }
              }}
            />
            <PasswordField
              password={passwordConfirmation}
              setPassword={setPasswordConfirmation}
              autocomplete="new-password"
              label={t('common:fields.repeatNewPassword')}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  void handleBindPassword()
                }
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setPasswordDialogMode(null)
              setCurrentPassword('')
              setPassword('')
              setPasswordConfirmation('')
            }}
            disabled={bindingPassword}
          >
            {t('common:actions.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleBindPassword()}
            loading={bindingPassword}
            disabled={!password || !passwordConfirmation || !currentPassword}
          >
            {t('common:actions.bind')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

export default ConnectedAccountsSection
