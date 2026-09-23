import type { ChatAdapter } from '@mui/x-chat/headless'

import { getChats, getMessages } from '@/api/http/chat'
import type { UserContextProps } from '@/context/user/UserContext'
import type { Chat as TChat, Message } from '@/types/Chat'
import type { UserId } from '@/types/UserId'
import { getAvatar } from '@/utils/getAvatar'

import { getConversationSubtitle, toConversation } from './chatConversation'
import { playConversationSound } from './conversationSound'

const activeChatEvent = 'oqucat:active-chat'

type ChatSubscribe = NonNullable<ChatAdapter<number>['subscribe']>

const isUserId = (value: string): value is UserId =>
  /^\w+-\w+-\w+-\w+-\w+$/u.test(value)

const toMessage = (
  message: Message,
  chat: TChat,
  userId: string,
  userAvatar?: string | null
) => ({
  id: String(message.id),
  conversationId: chat.user_id,
  role: message.from_id === userId ? ('user' as const) : ('assistant' as const),
  status: 'sent' as const,
  createdAt: message.createdAt,
  author: {
    id: message.from_id,
    displayName: message.from_id === userId ? 'You' : chat.name,
    avatarUrl:
      message.from_id === userId
        ? getAvatar(userAvatar)
        : getAvatar(chat.image),
  },
  parts: [{ type: 'text' as const, text: message.content }],
})

const toSocketMessage = (message: Message, chats: TChat[], userId: string) => {
  const chat = chats.find(
    (item) => item.user_id === message.from_id || item.user_id === message.to_id
  )
  return chat ? toMessage(message, chat, userId) : null
}

const createChatAdapter = (
  sio: NonNullable<UserContextProps['sio']>,
  userId: string,
  userAvatar?: string | null,
  onTypingChange?: (isTyping: boolean) => void,
  onPresenceChange?: (isOnline: boolean) => void,
  onUnreadCleared?: (count: number) => void
): ChatAdapter<number> => {
  let chats: TChat[] = []
  let activeConversationId: string | undefined
  let emitEvent: Parameters<ChatSubscribe>[0]['onEvent'] | undefined
  const readConversationIds = new Set<string>()
  const typingUsers = new Set<string>()
  const pendingMessages: { id: string; content: string; toId: string }[] = []

  const updateConversation = (chat: TChat, isTyping = false) => {
    emitEvent?.({
      type: 'conversation-updated',
      conversation: toConversation(
        chat,
        getConversationSubtitle(chat, isTyping)
      ),
    })
  }

  const markConversationRead = (conversationId: string, messageId?: string) => {
    const chat = chats.find((item) => item.user_id === conversationId)
    if (chat?.new_msg) {
      const unreadCount = chat.new_msg
      chat.new_msg = 0
      updateConversation(chat, typingUsers.has(conversationId))
      onUnreadCleared?.(unreadCount)
    } else if (!chat) {
      readConversationIds.add(conversationId)
    }
    sio.emit('chat-read', { conversationId, messageId })
  }

  return {
    async listConversations() {
      chats = (await getChats()) ?? []
      for (const chat of chats) {
        if (readConversationIds.delete(chat.user_id) && chat.new_msg) {
          const unreadCount = chat.new_msg
          chat.new_msg = 0
          onUnreadCleared?.(unreadCount)
        }
      }
      return { conversations: chats.map((chat) => toConversation(chat)) }
    },

    async listMessages({ conversationId, cursor }) {
      if (!isUserId(conversationId)) {
        return { messages: [], hasMore: false }
      }
      globalThis.dispatchEvent(
        new CustomEvent(activeChatEvent, { detail: conversationId })
      )
      activeConversationId = conversationId
      markConversationRead(conversationId)
      const page = await getMessages(conversationId, cursor)
      const chat = chats.find((item) => item.user_id === conversationId) ?? {
        user_id: conversationId,
        name: '',
        new_msg: 0,
        lastMessage: null,
        lastMessageDate: '',
        isLastMessageFromSelf: false,
        image: '',
        isOnline: false,
      }
      return {
        messages: (page?.messages ?? []).map((message) =>
          toMessage(message, chat, userId, userAvatar)
        ),
        cursor: page?.nextCursor ?? undefined,
        hasMore: page?.hasMore ?? false,
      }
    },

    setTyping({ conversationId, isTyping }) {
      sio.emit('chat-typing', { to_id: conversationId, isTyping })
      return Promise.resolve()
    },

    markRead({ conversationId, messageId }) {
      markConversationRead(conversationId, messageId)
      return Promise.resolve()
    },

    sendMessage({ conversationId, message }) {
      const content = message.parts.find((part) => part.type === 'text')
      if (conversationId && content?.type === 'text') {
        playConversationSound('sent')
        pendingMessages.push({
          id: message.id,
          content: content.text,
          toId: conversationId,
        })
        sio.emit('chat-message', {
          content: content.text,
          from_id: userId,
          to_id: conversationId,
        })
      }

      return Promise.resolve(
        new ReadableStream({
          start(controller) {
            controller.close()
          },
        })
      )
    },

    subscribe({ onEvent }) {
      emitEvent = onEvent
      const handleMessage = (message: Message) => {
        const conversationId =
          message.from_id === userId ? message.to_id : message.from_id
        const chat = chats.find((item) => item.user_id === conversationId)
        if (chat) {
          chat.lastMessage = message.content
          chat.lastMessageDate = message.createdAt
          chat.isLastMessageFromSelf = message.from_id === userId
          if (
            message.from_id !== userId &&
            activeConversationId !== conversationId
          ) {
            chat.new_msg += 1
          }
          updateConversation(chat, typingUsers.has(conversationId))
        }

        if (!activeConversationId || activeConversationId !== conversationId) {
          return
        }
        const chatMessage = toSocketMessage(message, chats, userId)
        if (chatMessage) {
          if (message.from_id === userId) {
            const pendingIndex = pendingMessages.findIndex(
              (pending) =>
                pending.content === message.content &&
                pending.toId === message.to_id
            )
            if (pendingIndex !== -1) {
              const [pending] = pendingMessages.splice(pendingIndex, 1)
              onEvent({
                type: 'message-removed',
                messageId: pending.id,
                conversationId: message.to_id,
              })
            }
            chatMessage.author.avatarUrl = getAvatar(userAvatar)
          } else {
            markConversationRead(conversationId)
          }
          onEvent({ type: 'message-added', message: chatMessage })
        }
      }
      const handleTyping = (event: {
        conversationId?: string
        userId?: string
        from_id?: string
        to_id?: string
        isTyping: boolean
      }) => {
        const conversationId =
          event.conversationId ?? event.from_id ?? event.to_id
        const typingUserId = event.userId ?? event.from_id

        if (conversationId && typingUserId) {
          if (conversationId === activeConversationId) {
            onTypingChange?.(event.isTyping)
          }
          if (event.isTyping) {
            typingUsers.add(typingUserId)
          } else {
            typingUsers.delete(typingUserId)
          }
          const chat = chats.find((item) => item.user_id === typingUserId)
          if (chat) {
            updateConversation(chat, event.isTyping)
          }
          onEvent({
            type: 'typing',
            conversationId,
            userId: typingUserId,
            isTyping: event.isTyping,
          })
        }
      }
      const handlePresence = (event: {
        userId?: string
        user_id?: string
        isOnline?: boolean
        online?: boolean
      }) => {
        const presenceUserId = event.userId ?? event.user_id
        const isOnline = event.isOnline ?? event.online ?? false
        if (presenceUserId) {
          if (presenceUserId === activeConversationId) {
            onPresenceChange?.(isOnline)
          }
          onEvent({ type: 'presence', userId: presenceUserId, isOnline })

          const chat = chats.find((item) => item.user_id === presenceUserId)
          if (chat) {
            chat.isOnline = isOnline
            updateConversation(chat, typingUsers.has(presenceUserId))
          }
        }
      }
      const handleRead = (event: {
        conversationId: string
        userId: string
        messageId?: number
      }) => {
        onEvent({
          type: 'read',
          conversationId: event.conversationId,
          userId: event.userId,
          messageId: event.messageId ? String(event.messageId) : undefined,
        })
      }
      sio.on('chat-message', handleMessage)
      sio.on('chat-typing', handleTyping)
      sio.on('chat-presence', handlePresence)
      sio.on('chat-read', handleRead)
      return () => {
        emitEvent = undefined
        sio.off('chat-message', handleMessage)
        sio.off('chat-typing', handleTyping)
        sio.off('chat-presence', handlePresence)
        sio.off('chat-read', handleRead)
      }
    },
  }
}

export { activeChatEvent, createChatAdapter, isUserId }
