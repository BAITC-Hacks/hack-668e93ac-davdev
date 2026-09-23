import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MdLogout as LogoutIcon } from 'react-icons/md'

import { updateAvatar } from '@/api/http/user'
import { authClient } from '@/auth/betterAuth'
import { getAvatar } from '@/utils/getAvatar'

const ProfileCard = () => {
  const { t } = useTranslation()
  const { data } = authClient.useSession()
  const user = data?.user

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleAvatarClick = () => {
    if (!uploading) {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''

    if (!file) {
      return
    }

    setUploading(true)

    try {
      const res = await updateAvatar(file)

      if (!res) {
        return
      }

      // The Better Auth client exposes its session atom as an untyped store.
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Better Auth exposes its session atom as an untyped store.
      const session = authClient.$store.atoms.session.get() as {
        data: typeof data
        [key: string]: unknown
      }
      if (session.data) {
        authClient.$store.atoms.session.set({
          ...session,
          data: {
            ...session.data,
            user: {
              ...session.data.user,
              image: res.newImage,
            },
          },
        })
      }
    } finally {
      setUploading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      sx={{ alignItems: 'center', justifyContent: 'center', m: 'auto' }}
    >
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <Avatar
        src={getAvatar(user.image) || ''}
        sx={{
          height: 100,
          width: 100,
          cursor: uploading ? 'default' : 'pointer',
        }}
        onClick={handleAvatarClick}
      />

      <Stack
        spacing={1}
        sx={{
          alignItems: { xs: 'center', md: 'flex-start' },
          width: { xs: 1, md: 'auto' },
        }}
      >
        <Typography variant="h5">{user.name}</Typography>

        <Typography variant="body2">{user.email}</Typography>

        <Button
          fullWidth
          color="error"
          variant="outlined"
          onClick={() => authClient.signOut()}
          startIcon={<LogoutIcon />}
          sx={{
            alignSelf: { xs: 'stretch', md: 'flex-start' },
            width: { md: 'auto' },
          }}
        >
          {t('common:profile.logOut')}
        </Button>
      </Stack>
    </Stack>
  )
}

export default ProfileCard
