import type { Server as HttpServer } from 'node:http'

import { Server } from 'socket.io'

import { trustedOrigins } from './config'
import { issueEmailVerificationTicket } from './modules/auth/emailVerificationSession'
import {
  sioChat,
  sioEmailVerification,
  sioMiddleware,
} from './modules/sio/socket'

let io: Server | undefined

export const initSio = (server: HttpServer) => {
  const instance = new Server(server, {
    cors: {
      origin: trustedOrigins,
      methods: ['GET', 'POST'],
    },
    path: '/ws',
    transports: ['websocket'],
  })

  instance.use(sioMiddleware)
  instance.on('connection', (socket) => {
    if (socket.data.isEmailVerification) {
      sioEmailVerification(socket)
      return
    }

    sioChat(instance, socket)
  })

  io = instance

  return instance
}

export const getIo = () => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized')
  }

  return io
}

export const emitEmailVerified = (userId: string, email: string) => {
  const ticket = issueEmailVerificationTicket(email)
  io?.to(`email-verification:${userId}`).emit('email-verified', { ticket })
}
