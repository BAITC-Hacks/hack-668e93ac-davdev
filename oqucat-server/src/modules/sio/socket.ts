import { fromNodeHeaders } from 'better-auth/node'
import i18next from 'i18next'
import { Op } from 'sequelize'
import type { ExtendedError, Server, Socket } from 'socket.io'
import { z } from 'zod'

import { logger } from '@/logger'

import cfg from '../../config'
import { auth } from '../auth/betterAuth'
import { Message } from '../chat/Message.model'
import { sendWebPush } from '../notification/firebase/sendWebPush'
import bot from '../telegram/bot'
import { PushInstallation } from '../user/PushInstallation.model'
import { User } from '../user/User.model'

const connectedSocketsByUser = new Map<string, number>()
const verificationAttemptsByIp = new Map<string, number[]>()
const verificationRateLimitWindowMs = 60_000
const verificationRateLimitMaxAttempts = 5

export const isUserOnline = (userId: string) =>
  (connectedSocketsByUser.get(userId) ?? 0) > 0

const authenticateSocket = async (
  socket: Socket,
  next: (err?: ExtendedError) => void
) => {
  try {
    const { cookie } = socket.handshake.headers

    if (!cookie) {
      next(new Error('No authentication cookie'))
      return
    }

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(socket.handshake.headers),
    })

    if (!session?.user) {
      next(new Error('Unauthorized'))
      return
    }

    socket.handshake.auth.userId = session.user.id
    return next()
  } catch (error) {
    logger.error({ error }, 'Socket authentication failed:')
    return next(new Error('Authentication failed'))
  }
}

const canAttemptVerificationSocketAuth = (ip: string) => {
  const now = Date.now()
  const attempts = (verificationAttemptsByIp.get(ip) ?? []).filter(
    (attempt) => now - attempt < verificationRateLimitWindowMs
  )

  if (attempts.length >= verificationRateLimitMaxAttempts) {
    verificationAttemptsByIp.set(ip, attempts)
    return false
  }

  attempts.push(now)
  verificationAttemptsByIp.set(ip, attempts)
  return true
}

const authenticateEmailVerificationSocket = async (
  socket: Socket,
  next: (err?: ExtendedError) => void
) => {
  const credentials = z
    .object({
      email: z.email(),
      password: z.string().min(1).max(1024),
    })
    .safeParse(socket.handshake.auth)

  if (
    !credentials.success ||
    !canAttemptVerificationSocketAuth(socket.handshake.address)
  ) {
    return next(new Error('Unauthorized'))
  }

  try {
    const context = await auth.$context
    const user = await context.internalAdapter.findUserByEmail(
      credentials.data.email,
      { includeAccounts: true }
    )
    const credentialAccount = user?.accounts.find(
      (account) => account.providerId === 'credential'
    )

    if (
      !user ||
      user.user.emailVerified ||
      !credentialAccount?.password ||
      !(await context.password.verify({
        hash: credentialAccount.password,
        password: credentials.data.password,
      }))
    ) {
      return next(new Error('Unauthorized'))
    }

    socket.data.userId = user.user.id
    socket.data.isEmailVerification = true
    next()
  } catch (error) {
    logger.error({ error }, 'Email-verification socket authentication failed')
    next(new Error('Authentication failed'))
  }
}

const chatMessageSchema = z.object({
  to_id: z.uuid(),
  content: z.string().trim().min(1).max(10_000),
})

export const sioMiddleware = (
  socket: Socket,
  next: (err?: ExtendedError) => void
) => {
  if (socket.handshake.auth.type === 'email-verification') {
    void authenticateEmailVerificationSocket(socket, next)
    return
  }

  void authenticateSocket(socket, next)
}

export const sioEmailVerification = (socket: Socket) => {
  const { userId } = socket.data
  if (typeof userId !== 'string') {
    socket.disconnect(true)
    return
  }

  void socket.join(`email-verification:${userId}`)
}

export const sioChat = (io: Server, socket: Socket) => {
  logger.info({ sid: socket.id }, 'User connected')
  const { userId } = socket.handshake.auth
  if (typeof userId !== 'string') {
    logger.error({ sid: socket.id }, 'Socket user ID is missing or invalid')
    return
  }

  const wasOffline = !isUserOnline(userId)
  connectedSocketsByUser.set(
    userId,
    (connectedSocketsByUser.get(userId) ?? 0) + 1
  )
  if (wasOffline) {
    socket.broadcast.emit('chat-presence', { userId, isOnline: true })
  }

  void socket.join(`user:${userId}`)

  socket.on('chat-typing', (data: unknown) => {
    const parsed = z
      .object({
        to_id: z.uuid(),
        isTyping: z.boolean(),
      })
      .safeParse(data)
    if (parsed.success && parsed.data.to_id !== userId) {
      io.to(`user:${parsed.data.to_id}`).emit('chat-typing', {
        conversationId: userId,
        userId,
        isTyping: parsed.data.isTyping,
      })
    }
  })

  socket.on('chat-read', (data: unknown) => {
    void (async () => {
      const parsed = z
        .object({
          conversationId: z.uuid(),
          messageId: z.coerce.number().int().positive().optional(),
        })
        .safeParse(data)
      if (!parsed.success) {
        return
      }
      await Message.update(
        { read: true },
        {
          where: {
            from_id: parsed.data.conversationId,
            to_id: userId,
            ...(parsed.data.messageId
              ? { id: { [Op.lte]: parsed.data.messageId } }
              : {}),
            read: false,
          },
        }
      )
      io.to(`user:${parsed.data.conversationId}`).emit('chat-read', {
        conversationId: userId,
        userId,
        messageId: parsed.data.messageId,
      })
    })()
  })

  socket.on('chat-message', (data: unknown) => {
    void (async () => {
      const parsed = chatMessageSchema.safeParse(data)
      if (!parsed.success || parsed.data.to_id === userId) {
        return
      }

      const messageData = {
        ...parsed.data,
        from_id: userId,
      }
      const createdMessage = await Message.create(messageData)
      const message = await Message.findByPk(createdMessage.id, {
        include: [
          {
            model: User,
            as: 'from',
            attributes: ['id', 'name', 'image'],
          },
          {
            model: User,
            as: 'to',
            attributes: ['id', 'name', 'image', 'telegramId'],
          },
        ],
      })

      if (!message) {
        return
      }

      const receiver = message.to
      const sender = message.from

      const payload = {
        id: message.id,
        content_type: 0,
        content: message.content,
        from_id: message.from_id,
        to_id: message.to_id,
        createdAt: message.createdAt,
        from: {
          name: sender.name,
          image: sender.image,
        },
      }

      io.to(`user:${message.to_id}`).emit('chat-message', payload)
      io.to(`user:${message.from_id}`).emit('chat-message', payload)

      const receiverSockets = await io
        .in(`user:${message.to_id}`)
        .fetchSockets()

      if (receiverSockets.length > 0) {
        return
      }

      if (receiver.telegramId) {
        const text = `${sender.name}: ${message.content}`

        void bot.api.sendMessage(receiver.telegramId, text)
      }

      const user = await User.findByPk(message.to_id, {
        include: PushInstallation,
      })

      if (user) {
        const t = i18next.getFixedT(user.locale)

        void sendWebPush(user, {
          title: t('notifications.newMessageFrom', {
            name: sender.name.trim(),
          }),
          body: message.content,
          icon: sender.image
            ? `${cfg.CLIENT}/api/avatars/${sender.image}`
            : undefined,
          urgent: true,
        })
      }
    })()
  })

  socket.on('disconnect', (m) => {
    const currentSocketCount = connectedSocketsByUser.get(userId) ?? 1
    const socketCount = currentSocketCount - 1
    if (socketCount > 0) {
      connectedSocketsByUser.set(userId, socketCount)
    } else {
      connectedSocketsByUser.delete(userId)
      socket.broadcast.emit('chat-presence', { userId, isOnline: false })
    }
    logger.info({ sid: socket.id, m }, 'User disconnected')
  })
}
