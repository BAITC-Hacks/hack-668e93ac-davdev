import type { UserId } from './UserId'

export interface Chat {
  user_id: UserId
  name: string
  new_msg: number
  lastMessage: string | null
  lastMessageDate: string | null
  isLastMessageFromSelf: boolean
  image: string
  isOnline: boolean
}

export interface Message {
  id: number
  content_type: number
  content: string
  from_id: UserId
  to_id: UserId
  createdAt: string
  from?: {
    name: string
    image: string | null
  }
}

export type UserMap = Record<
  number,
  {
    name: string
    image: string
  }
>
