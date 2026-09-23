import Box from '@mui/material/Box'
import { MdAccountCircle as AccountCircleIcon } from 'react-icons/md'

import { authClient } from '@/auth/betterAuth'
import { getAvatar } from '@/utils/getAvatar'

const UserAvatarFallback = () => {
  const { data } = authClient.useSession()
  const user = data?.user

  if (!user) {
    return <AccountCircleIcon />
  }
  if (user.image) {
    return (
      <Box
        sx={{
          height: 24,
          width: 24,
          borderRadius: '50%',
          // mb: { xs: 0, sm: '6px' },
        }}
      >
        <img
          height="100%"
          width="100%"
          style={{
            borderRadius: '50%',
          }}
          src={getAvatar(user.image) || ''}
        />
      </Box>
    )
  }
  return <AccountCircleIcon />
}

export default UserAvatarFallback
