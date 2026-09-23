import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { MdKeyboard as KeyboardIcon } from 'react-icons/md'

interface ChatStatusProps {
  isOnline: boolean
  isTyping: boolean
}

const ChatStatus = ({ isOnline, isTyping }: ChatStatusProps) => (
  <Box
    sx={{
      position: 'absolute',
      top: 12,
      right: 12,
      zIndex: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 0.75,
      px: 1,
      py: 0.5,
      border: 1,
      borderColor: 'divider',
      borderRadius: 10,
      bgcolor: 'background.paper',
      boxShadow: 1,
    }}
  >
    {isTyping ? (
      <KeyboardIcon
        size="1em"
        style={{ animation: 'chat-typing 0.8s ease-in-out infinite' }}
      />
    ) : (
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: isOnline ? 'success.main' : 'transparent',
          border: 1,
          borderColor: isOnline ? 'success.main' : 'text.disabled',
          animation: isOnline
            ? 'chat-online 1.4s ease-in-out infinite'
            : undefined,
        }}
      />
    )}
    <Typography
      variant="caption"
      color={
        isTyping ? 'info.main' : isOnline ? 'success.main' : 'text.secondary'
      }
    >
      {isTyping ? 'Typing' : isOnline ? 'Online' : 'Offline'}
    </Typography>
  </Box>
)

export default ChatStatus
