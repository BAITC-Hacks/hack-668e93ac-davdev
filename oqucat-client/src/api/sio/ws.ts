import { useEffect, useMemo } from 'react'
import { io, type Socket } from 'socket.io-client'

import type { BetterAuthUser } from '@/auth/betterAuth'
import { baseWSURL } from '@/config'

const sockets = new Map<string, Socket>()

const getSocket = (userId: string) => {
  const existing = sockets.get(userId)
  if (existing) {
    if (!existing.connected) {
      existing.connect()
    }
    return existing
  }

  const socket = io(baseWSURL, {
    path: '/ws',
    transports: ['websocket'],
    withCredentials: true,
    autoConnect: false,
  })
  sockets.set(userId, socket)
  socket.connect()
  return socket
}

export const useSocket = (user: BetterAuthUser | undefined) => {
  const userId = user?.id
  const socket = useMemo(() => (userId ? getSocket(userId) : null), [userId])

  useEffect(
    () => () => {
      socket?.disconnect()
      if (userId) {
        sockets.delete(userId)
      }
    },
    [socket, userId]
  )

  return socket
}
