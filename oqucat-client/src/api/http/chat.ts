import type { Chat, Message } from '@/types/Chat'
import type { UserId } from '@/types/UserId'

import { apiRequest, host } from '.'

export const getChats = () => apiRequest<Chat[]>(host.get('chat/chats'))

export const getUserMapping = () => apiRequest(host.get('chat/users'))

export interface MessagesPage {
  messages: Message[]
  nextCursor: number | null
  hasMore: boolean
}

export const getMessages = (chatUserId: UserId, cursor?: number) =>
  apiRequest<MessagesPage>(
    host.get(`chat/messages/${chatUserId}`, {
      params: cursor === undefined ? undefined : { cursor },
    })
  )

export const getUnreadCount = () =>
  apiRequest<number>(host.get<number>('chat/get_unread'))
