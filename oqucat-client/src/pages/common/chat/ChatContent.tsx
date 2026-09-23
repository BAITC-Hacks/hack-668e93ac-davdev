import { ChatBox } from '@mui/x-chat'
import type { ChatAdapter } from '@mui/x-chat/headless'

import { getAvatar } from '@/utils/getAvatar'

interface ChatContentProps {
  activeConversationId?: string
  adapter: ChatAdapter<number>
  onActiveConversationChange: (conversationId: string | undefined) => void
  user: {
    id: string
    image?: string | null
    name: string
  }
}

const ChatContent = ({
  activeConversationId,
  adapter,
  onActiveConversationChange,
  user,
}: ChatContentProps) => (
  <ChatBox
    adapter={adapter}
    currentUser={{
      id: user.id,
      displayName: user.name,
      avatarUrl: getAvatar(user.image),
    }}
    getMessageAuthorDisplayName={(message) =>
      message.role === 'user' ? user.name : message.author?.displayName
    }
    getMessageAuthorAvatarUrl={(message) =>
      message.role === 'user'
        ? getAvatar(user.image)
        : message.author?.avatarUrl
    }
    onActiveConversationChange={onActiveConversationChange}
    activeConversationId={activeConversationId}
    features={{
      conversationList: true,
      conversationHeader: true,
      dateDivider: true,
      unreadMarker: true,
      attachments: false,
      helperText: true,
      scrollToBottom: true,
      autoScroll: { buffer: 300 },
      suggestions: false,
      typingSignal: true,
      streamingIndicator: true,
    }}
    sx={{ height: 1, border: 0, borderRadius: 0 }}
  />
)

export default ChatContent
