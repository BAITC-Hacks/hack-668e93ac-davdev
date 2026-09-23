import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { authClient } from '@/auth/betterAuth'
import LangChip from '@/components/i18n/LangChip'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import { notify } from '@/context/notification/notify'
import ProfileCard from '@/pages/common/profile/ProfileCard'

import ConnectedAccountsSection from './ConnectedAccountsSection'
import PasskeySection from './PasskeySection'
import SessionsSection from './SessionsSection'
import TwoFactorSection from './TwoFactorSection'

const Profile = () => {
  const { t } = useTranslation()
  const { data, isPending, refetch } = authClient.useSession()
  const user = data?.user

  const [name, setName] = useState(() => user?.name ?? '')

  const [savingProfile, setSavingProfile] = useState(false)

  const handleSave = async () => {
    if (!user) {
      return
    }

    const trimmedName = name.trim()

    if (!trimmedName) {
      return
    }

    setSavingProfile(true)

    try {
      const { error } = await authClient.updateUser({
        name: trimmedName,
      })

      if (error) {
        notify.error(error.message)
        return
      }

      notify.success(t('common:api.success.profileUpdated'))
    } finally {
      setSavingProfile(false)
    }
  }

  if (!user || isPending) {
    return null
  }

  return (
    <Paper
      elevation={5}
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'minmax(0, 1fr)',
          md: 'repeat(2, minmax(0, 1fr))',
        },
        gap: { xs: 0, md: 3 },
        p: 3,
        my: 2,
        width: { xs: 1, sm: 400, md: 800 },
        maxWidth: '100%',
        margin: 'auto',
        position: 'relative',
        overflow: 'auto',
      }}
    >
      <Box sx={{ gridColumn: '1 / -1' }}>
        <ProfileCard />
      </Box>

      <Divider sx={{ gridColumn: '1 / -1', my: { xs: 2, md: 0 } }} />

      <Box
        sx={{
          display: 'grid',
          gridColumn: '1 / -1',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            md: 'minmax(0, 1fr) auto minmax(0, 1fr)',
          },
          gap: { xs: 0, md: 3 },
          alignItems: 'center',
        }}
      >
        <Stack spacing={1}>
          <Typography variant="subtitle2" sx={{ textAlign: 'center' }}>
            {t('common:profile.theme.title')}
          </Typography>
          <ThemeSwitcher />
        </Stack>

        <Divider
          sx={{
            display: { xs: 'block', md: 'none' },
            gridColumn: '1 / -1',
            my: 2,
          }}
        />
        <Divider
          orientation="vertical"
          sx={{
            display: { xs: 'none', md: 'block' },
            height: '100%',
          }}
        />

        <Stack spacing={1}>
          <Typography variant="subtitle2" sx={{ textAlign: 'center' }}>
            {t('common:profile.language')}
          </Typography>
          <LangChip />
        </Stack>
      </Box>

      <Divider sx={{ gridColumn: '1 / -1', my: { xs: 2, md: 0 } }} />
      <Box
        sx={{
          display: 'grid',
          gridColumn: '1 / -1',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            md: 'minmax(0, 1fr) auto minmax(0, 1fr)',
          },
          gap: { xs: 0, md: 3 },
          alignItems: 'center',
        }}
      >
        <TwoFactorSection
          enabled={Boolean(user.twoFactorEnabled)}
          onStatusChange={refetch}
        />

        <Divider
          sx={{
            display: { xs: 'block', md: 'none' },
            gridColumn: '1 / -1',
            my: 2,
          }}
        />
        <Divider
          orientation="vertical"
          sx={{
            display: { xs: 'none', md: 'block' },
            height: '100%',
          }}
        />

        <PasskeySection />
      </Box>

      <Divider sx={{ gridColumn: '1 / -1', my: { xs: 2, md: 0 } }} />
      <ConnectedAccountsSection />

      <Divider sx={{ gridColumn: '1 / -1', my: { xs: 2, md: 0 } }} />
      <Box sx={{ gridColumn: '1 / -1' }}>
        <SessionsSection />
      </Box>

      <Divider sx={{ gridColumn: '1 / -1', my: { xs: 2, md: 0 } }} />

      <Box sx={{ gridColumn: '1 / -1' }}>
        <Stack spacing={2}>
          <Typography variant="subtitle2">
            {t('common:profile.editTitle')}
          </Typography>

          <TextField
            label={t('common:fields.firstName')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            autoComplete="name"
          />

          <Button
            variant="contained"
            onClick={handleSave}
            loading={savingProfile}
            disabled={!name.trim() || name.trim() === user.name}
          >
            {t('common:actions.save')}
          </Button>
        </Stack>
      </Box>

      {/* TODO: Notification settings (choose TG/App/Inbox) */}
    </Paper>
  )
}

export default Profile
