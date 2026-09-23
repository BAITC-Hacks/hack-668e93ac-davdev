import Badge from '@mui/material/Badge'
import { MdChat as ChatIcon } from 'react-icons/md'

import { useUser } from '@/context/user/useUser'

const ChatBadge = () => {
  const { unreadCount } = useUser()
  return (
    <Badge badgeContent={unreadCount} color="error">
      <ChatIcon />
    </Badge>
  )
}

export default ChatBadge
