import { Router } from 'express'
import { Op } from 'sequelize'

import type { UserID } from '@/types/UserId'

import { validateRequest } from '../../middleware/validateRequest'
import { TeamMemberStatus } from '../../types/TeamMemberStatus'
import { UserRole } from '../../types/UserRole'
import { ProjectApplication } from '../application/ProjectApplication.model'
import { ProjectCard } from '../card/ProjectCard.model'
import { Company } from '../company/Company.model'
import { isUserOnline } from '../sio/socket'
import { TeamMember } from '../team/TeamMember.model'
import { User } from '../user/User.model'
import { getChatsSchema, getMessagesSchema } from './chat.schemas'
import { Message } from './Message.model'

const r = Router()

const getChatUserIds = async (user: User): Promise<UserID[] | null> => {
  if (user.role === UserRole.SUPERADMIN) {
    return null
  }

  if (user.role === UserRole.BUSINESS) {
    const company = await Company.findOne({
      where: { owner_id: user.id },
      attributes: ['id'],
    })
    if (!company) {
      return []
    }

    const cards = await ProjectCard.findAll({
      where: { company_id: company.id },
      attributes: ['id'],
    })
    const applications = await ProjectApplication.findAll({
      where: { card_id: { [Op.in]: cards.map(({ id }) => id) } },
      attributes: ['team_id'],
    })
    const memberships = await TeamMember.findAll({
      where: {
        team_id: { [Op.in]: applications.map(({ team_id }) => team_id) },
        status: TeamMemberStatus.ACCEPTED,
      },
      attributes: ['user_id'],
    })

    return [...new Set(memberships.map(({ user_id }) => user_id))]
  }

  if (user.role === UserRole.USER) {
    const memberships = await TeamMember.findAll({
      where: { user_id: user.id, status: TeamMemberStatus.ACCEPTED },
      attributes: ['team_id'],
    })
    const applications = await ProjectApplication.findAll({
      where: {
        team_id: { [Op.in]: memberships.map(({ team_id }) => team_id) },
      },
      attributes: ['card_id'],
    })
    const cards = await ProjectCard.findAll({
      where: { id: { [Op.in]: applications.map(({ card_id }) => card_id) } },
      attributes: ['company_id'],
    })
    const companies = await Company.findAll({
      where: {
        id: { [Op.in]: cards.map(({ company_id }) => company_id) },
      },
      attributes: ['owner_id'],
    })

    return [...new Set(companies.map(({ owner_id }) => owner_id))]
  }

  return []
}

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

  const chatUserIds = await getChatUserIds(me)
  const users = await User.findAll({
    where: {
      id: {
        [Op.ne]: userId,
        ...(chatUserIds ? { [Op.in]: chatUserIds } : {}),
      },
    },
    attributes: ['id', 'name', 'role', 'image'],
    order: [['name', 'ASC']],
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
