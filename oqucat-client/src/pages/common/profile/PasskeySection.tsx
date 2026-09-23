import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  MdCheck as CheckIcon,
  MdClose as CloseIcon,
  MdDelete as DeleteIcon,
  MdEdit as EditIcon,
  MdFingerprint as FingerprintIcon,
} from 'react-icons/md'

import { authClient } from '@/auth/betterAuth'
import { notify } from '@/context/notification/notify'

const PasskeySection = () => {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [loading, setLoading] = useState(false)
  const {
    data: passkeys,
    error: passkeysError,
    isPending: passkeysPending,
    refetch: refetchPasskeys,
  } = authClient.useListPasskeys()

  const handlePasskeyError = (error: { message?: string } | null) => {
    if (error) {
      notify.error(error.message ?? t('common:profile.passkey.manageFailed'))
    }
  }

  const handleAddPasskey = async () => {
    setLoading(true)

    try {
      const { error } = await authClient.passkey.addPasskey({
        name: name.trim() || undefined,
      })

      if (error) {
        notify.error(error.message ?? t('common:auth.passkey.addFailed'))
        return
      }

      setName('')
      await refetchPasskeys()
      notify.success(t('common:profile.passkey.added'))
    } finally {
      setLoading(false)
    }
  }

  const handleRenamePasskey = async (id: string) => {
    const trimmedName = editingName.trim()

    if (!trimmedName) {
      return
    }

    setLoading(true)

    try {
      const { error } = await authClient.$fetch('/passkey/update-passkey', {
        method: 'POST',
        body: { id, name: trimmedName },
      })

      if (error) {
        handlePasskeyError(error)
        return
      }

      setEditingId(null)
      await refetchPasskeys()
      notify.success(t('common:profile.passkey.updated'))
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePasskey = async (id: string) => {
    // oxlint-disable-next-line no-alert
    if (!globalThis.confirm(t('common:profile.passkey.removeConfirmation'))) {
      return
    }

    setLoading(true)

    try {
      const { error } = await authClient.$fetch('/passkey/delete-passkey', {
        method: 'POST',
        body: { id },
      })

      if (error) {
        handlePasskeyError(error)
        return
      }

      await refetchPasskeys()
      notify.success(t('common:profile.passkey.removed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" sx={{ textAlign: 'center' }}>
        {t('common:profile.passkey.title')}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textAlign: 'center' }}
      >
        {t('common:profile.passkey.description')}
      </Typography>
      {passkeysError ? (
        <Typography variant="body2" color="error">
          {t('common:profile.passkey.loadFailed')}
        </Typography>
      ) : null}
      {!passkeysPending && passkeys && passkeys.length > 0 ? (
        <Paper variant="outlined" sx={{ px: 2 }}>
          <Stack divider={<Divider />}>
            {passkeys.map((passkey) => {
              const isEditing = editingId === passkey.id

              return (
                <Stack
                  key={passkey.id}
                  direction="row"
                  spacing={1}
                  sx={{ py: 1, alignItems: 'center' }}
                >
                  {isEditing ? (
                    <TextField
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                      size="small"
                      fullWidth
                      autoFocus
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          void handleRenamePasskey(passkey.id)
                        }
                      }}
                    />
                  ) : (
                    <Stack sx={{ minWidth: 0, flex: 1 }}>
                      <Typography noWrap>
                        {passkey.name ?? t('common:profile.passkey.unnamed')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('common:profile.passkey.addedOn', {
                          date: new Date(
                            String(passkey.createdAt)
                          ).toLocaleDateString(),
                        })}
                      </Typography>
                    </Stack>
                  )}
                  {isEditing ? (
                    <>
                      <IconButton
                        aria-label={t('common:actions.save')}
                        onClick={() => void handleRenamePasskey(passkey.id)}
                        disabled={loading || !editingName.trim()}
                      >
                        <CheckIcon />
                      </IconButton>
                      <IconButton
                        aria-label={t('common:actions.cancel')}
                        onClick={() => setEditingId(null)}
                        disabled={loading}
                      >
                        <CloseIcon />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton
                        aria-label={t('common:profile.passkey.rename')}
                        onClick={() => {
                          setEditingId(passkey.id)
                          setEditingName(passkey.name ?? '')
                        }}
                        disabled={loading}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        aria-label={t('common:actions.delete')}
                        color="error"
                        onClick={() => void handleDeletePasskey(passkey.id)}
                        disabled={loading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </Stack>
              )
            })}
          </Stack>
        </Paper>
      ) : null}
      <TextField
        label={t('common:profile.passkey.name')}
        value={name}
        onChange={(event) => setName(event.target.value)}
        size="small"
        fullWidth
      />
      <Button
        variant="contained"
        startIcon={<FingerprintIcon />}
        onClick={() => void handleAddPasskey()}
        loading={loading}
      >
        {t('common:profile.passkey.add')}
      </Button>
    </Stack>
  )
}

export default PasskeySection
