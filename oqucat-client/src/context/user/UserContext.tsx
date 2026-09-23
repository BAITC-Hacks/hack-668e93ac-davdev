import { createContext, type Dispatch, type SetStateAction } from 'react'
import type { Socket } from 'socket.io-client'

export interface UserContextProps {
  sio: Socket | null
  unreadCount: number
  setUnreadCount: Dispatch<SetStateAction<number>>
}

export const UserContext = createContext<UserContextProps | undefined>(
  undefined
)
