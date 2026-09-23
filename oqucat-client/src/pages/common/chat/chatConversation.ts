import type { ChatConversation } from '@mui/x-chat/headless'

import type { Chat as TChat } from '@/types/Chat'
import { getAvatar } from '@/utils/getAvatar'

const getConversationSubtitle = (chat: TChat, isTyping = false) => {
  const status = isTyping ? '✍' : chat.isOnline ? '●' : '○'
  const statusName = isTyping ? 'Typing' : chat.isOnline ? 'Online' : 'Offline'
  const content = chat.lastMessage
    ? `| ${chat.isLastMessageFromSelf ? 'You: ' : ''}${chat.lastMessage}`
    : statusName

  return `${status} ${content}`
}

const toConversation = (
  chat: TChat,
  subtitle = getConversationSubtitle(chat)
): ChatConversation => ({
  id: chat.user_id,
  title: chat.name,
  subtitle,
  avatarUrl: getAvatar(chat.image),
  unreadCount: chat.new_msg,
  readState: chat.new_msg > 0 ? ('unread' as const) : ('read' as const),
  lastMessageAt: chat.lastMessageDate ?? undefined,
})

export { getConversationSubtitle, toConversation }
