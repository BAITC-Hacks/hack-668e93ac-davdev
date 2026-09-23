import { Router } from 'express'
import { Op } from 'sequelize'

import sequelize from '../../db'
import requireRole from '../../middleware/requireRole'
import { validateRequest } from '../../middleware/validateRequest'
import { TeamMemberStatus } from '../../types/TeamMemberStatus'
import { UserRole } from '../../types/UserRole'
import { Review } from '../review/Review.model'
import { StudentProfile } from '../student/StudentProfile.model'
import { StudentTag } from '../student/StudentTag.model'
import { Tag } from '../tag/Tag.model'
import { User } from '../user/User.model'
import { Team } from './Team.model'
import {
  createTeamSchema,
  inviteTeamMemberSchema,
  removeTeamMemberSchema,
  respondToInvitationSchema,
  teamParamsSchema,
  updateTeamSchema,
} from './team.schemas'
import { TeamMember } from './TeamMember.model'

const r = Router()

const serializeTeam = async (team: Team, includePending = false) => {
  const memberWhere = {
    team_id: team.id,
    ...(includePending ? {} : { status: TeamMemberStatus.ACCEPTED }),
  }
  const [captain, memberships, reviews] = await Promise.all([
    User.findByPk(team.captain_id, {
      attributes: ['id', 'name', 'image'],
    }),
    TeamMember.findAll({
      where: memberWhere,
      include: [{ association: 'user', attributes: ['id', 'name', 'image'] }],
      order: [['createdAt', 'ASC']],
    }),
    Review.findAll({ where: { team_id: team.id }, attributes: ['rating'] }),
  ])
  const userIds = memberships.map(({ user_id }) => user_id)
  const studentTags = await StudentTag.findAll({
    where: { student_id: { [Op.in]: userIds } },
    include: [Tag],
  })
  const tagsByStudent = new Map<string, Tag[]>()

  for (const studentTag of studentTags) {
    const tags = tagsByStudent.get(studentTag.student_id) ?? []
    tags.push(studentTag.tag)
    tagsByStudent.set(studentTag.student_id, tags)
  }

  const ratingTotal = reviews.reduce(
    (total, review) => total + review.rating,
    0
  )

  return {
    team: team.toJSON(),
    captain,
    members: memberships.map((membership) => ({
      membership: membership.toJSON(),
      tags: tagsByStudent.get(membership.user_id) ?? [],
    })),
    rating: reviews.length > 0 ? ratingTotal / reviews.length : null,
    reviews_count: reviews.length,
  }
}

r.get('/mine', requireRole([UserRole.USER]), async (req, res) => {
  const memberships = await TeamMember.findAll({
    where: { user_id: req.user.id },
    include: [Team],
    order: [['createdAt', 'DESC']],
  })

  return res.json(memberships)
})

r.post(
  '/',
  requireRole([UserRole.USER]),
  validateRequest(createTeamSchema),
  async (req, res) => {
    const student = await StudentProfile.findByPk(req.user.id)

    if (!student) {
      return res.status(403).json({ message: 'student_profile_required' })
    }

    const team = await sequelize.transaction(async (transaction) => {
      const createdTeam = await Team.create(
        {
          ...req.body,
          captain_id: req.user.id,
        },
        { transaction }
      )
      await TeamMember.create(
        {
          team_id: createdTeam.id,
          user_id: req.user.id,
          status: TeamMemberStatus.ACCEPTED,
          joined_at: new Date(),
        },
        { transaction }
      )
      return createdTeam
    })

    return res.status(201).json(await serializeTeam(team, true))
  }
)

r.get('/:teamId', validateRequest(teamParamsSchema), async (req, res) => {
  const team = await Team.findByPk(req.params.teamId)

  if (!team) {
    return res.status(404).json({ message: 'team_not_found' })
  }

  return res.json(await serializeTeam(team, team.captain_id === req.user.id))
})

r.patch(
  '/:teamId',
  requireRole([UserRole.USER]),
  validateRequest({ ...teamParamsSchema, ...updateTeamSchema }),
  async (req, res) => {
    const team = await Team.findByPk(req.params.teamId)

    if (!team) {
      return res.status(404).json({ message: 'team_not_found' })
    }
    if (team.captain_id !== req.user.id) {
      return res.status(403).json({ message: 'captain_required' })
    }

    await team.update(req.body)
    return res.json(await serializeTeam(team, true))
  }
)

r.post(
  '/:teamId/invitations',
  requireRole([UserRole.USER]),
  validateRequest(inviteTeamMemberSchema),
  async (req, res) => {
    const team = await Team.findByPk(req.params.teamId)

    if (!team) {
      return res.status(404).json({ message: 'team_not_found' })
    }
    if (team.captain_id !== req.user.id) {
      return res.status(403).json({ message: 'captain_required' })
    }
    if (req.body.user_id === req.user.id) {
      return res.status(400).json({ message: 'captain_already_member' })
    }

    const student = await StudentProfile.findByPk(req.body.user_id)
    if (!student) {
      return res.status(404).json({ message: 'student_profile_not_found' })
    }

    const [membership, created] = await TeamMember.findOrCreate({
      where: { team_id: team.id, user_id: req.body.user_id },
      defaults: {
        team_id: team.id,
        user_id: req.body.user_id,
        invited_by: req.user.id,
      },
    })

    if (!created && membership.status !== TeamMemberStatus.DECLINED) {
      return res.status(409).json({ message: 'team_member_already_exists' })
    }
    if (!created) {
      await membership.update({
        status: TeamMemberStatus.PENDING,
        invited_by: req.user.id,
        joined_at: null,
      })
    }

    return res.status(created ? 201 : 200).json(membership)
  }
)

r.patch(
  '/:teamId/invitations/me',
  requireRole([UserRole.USER]),
  validateRequest(respondToInvitationSchema),
  async (req, res) => {
    const membership = await TeamMember.findOne({
      where: {
        team_id: req.params.teamId,
        user_id: req.user.id,
        status: TeamMemberStatus.PENDING,
      },
    })

    if (!membership) {
      return res.status(404).json({ message: 'invitation_not_found' })
    }

    await membership.update({
      status: req.body.status,
      joined_at:
        req.body.status === TeamMemberStatus.ACCEPTED ? new Date() : null,
    })
    return res.json(membership)
  }
)

r.delete(
  '/:teamId/members/:userId',
  requireRole([UserRole.USER]),
  validateRequest(removeTeamMemberSchema),
  async (req, res) => {
    const team = await Team.findByPk(req.params.teamId)

    if (!team) {
      return res.status(404).json({ message: 'team_not_found' })
    }
    if (req.params.userId === team.captain_id) {
      return res.status(400).json({ message: 'captain_cannot_leave' })
    }
    if (team.captain_id !== req.user.id && req.params.userId !== req.user.id) {
      return res.status(403).json({ message: 'forbidden' })
    }

    const removed = await TeamMember.destroy({
      where: {
        team_id: team.id,
        user_id: req.params.userId,
      },
    })

    if (!removed) {
      return res.status(404).json({ message: 'team_member_not_found' })
    }

    return res.sendStatus(204)
  }
)

export { r as teamRouter }
