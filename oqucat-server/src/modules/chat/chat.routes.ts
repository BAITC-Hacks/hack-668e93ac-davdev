import { Router } from 'express'
import { Op } from 'sequelize'

import type { UserID } from '@/types/UserId'

import { validateRequest } from '../../middleware/validateRequest'
import type { UserRole } from '../../types/UserRole'
import { isUserOnline } from '../sio/socket'
import { User } from '../user/User.model'
import { getChatsSchema, getMessagesSchema } from './chat.schemas'
import { Message } from './Message.model'

const r = Router()

r.get(
  '/messages/:chatUserId',
  validateRequest(getMessagesSchema),
  async (req, res) => {
    const userId = req.user.id
    const { chatUserId } = req.params
    const { cursor, limit } = req.query

    const messages = await Message.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { from_id: userId, to_id: chatUserId },
              { from_id: chatUserId, to_id: userId },
            ],
          },
          ...(cursor ? [{ id: { [Op.lt]: cursor } }] : []),
        ],
      },
      order: [['id', 'DESC']],
      limit,
    })
    const orderedMessages = messages.toReversed()

    return res.json({
      messages: orderedMessages,
      nextCursor: messages.length === limit ? orderedMessages[0]?.id : null,
      hasMore: messages.length === limit,
    })
  }
)
r.get('/chats', validateRequest(getChatsSchema), async (req, res) => {
  const userId = req.user.id

  const me = await User.findByPk(userId)
  if (!me) {
    return res.status(404).json({ message: 'user_nf' })
  }

  const users = await User.findAll({
    where: { id: { [Op.ne]: userId } },
    attributes: ['id', 'name', 'role', 'image'],
  })

  const messages = await Message.findAll({
    where: {
      [Op.or]: [{ from_id: userId }, { to_id: userId }],
    },
    order: [['createdAt', 'DESC']],
  })

  const chatMap: Partial<
    Record<
      string,
      {
        user_id: UserID
        name: string
        isOnline: boolean
        isLastMessageFromSelf: boolean
        lastMessage: string | null
        lastMessageDate: Date | null
        new_msg: number
        role: UserRole
        image: string | null
      }
    >
  > = {}

  for (const u of users) {
    chatMap[u.id] = {
      user_id: u.id,
      name: u.name.trim(),
      isOnline: isUserOnline(u.id),
      isLastMessageFromSelf: false,
      lastMessage: null,
      lastMessageDate: null,
      new_msg: 0,
      role: u.role,
      image: u.image,
    }
  }

  for (const msg of messages) {
    const isSender = msg.from_id === userId
    const otherUserId = isSender ? msg.to_id : msg.from_id

    const chat = chatMap[otherUserId]
    if (!chat) {
      continue
    }

    if (!chat.lastMessageDate && msg.createdAt instanceof Date) {
      chat.lastMessageDate = msg.createdAt
      chat.lastMessage = msg.content
      chat.isLastMessageFromSelf = isSender
    }

    if (!isSender && !msg.read) {
      chat.new_msg += 1
    }
  }

  return res.json(Object.values(chatMap))
})

r.get('/get_unread', async (req, res) => {
  const userId = req.user.id

  const unreadCount = await Message.count({
    where: {
      to_id: userId,
      read: false,
    },
  })

  return res.json(unreadCount)
})

export { r as chatRouter }
