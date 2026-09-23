import { Router } from 'express'
import { Op } from 'sequelize'

import sequelize from '../../db'
import requireRole from '../../middleware/requireRole'
import { validateRequest } from '../../middleware/validateRequest'
import { ApplicationDecisionStatus } from '../../types/ApplicationDecisionStatus'
import { ApplicationStatus } from '../../types/ApplicationStatus'
import { CardStatus } from '../../types/CardStatus'
import { PointTransactionReason } from '../../types/PointTransactionReason'
import { TeamMemberStatus } from '../../types/TeamMemberStatus'
import { UserRole } from '../../types/UserRole'
import { ProjectCard } from '../card/ProjectCard.model'
import { Company } from '../company/Company.model'
import { StudentPointHistory } from '../points/StudentPointHistory.model'
import { TeamPointHistory } from '../points/TeamPointHistory.model'
import { StudentProfile } from '../student/StudentProfile.model'
import { StudentTag } from '../student/StudentTag.model'
import { Tag } from '../tag/Tag.model'
import { Team } from '../team/Team.model'
import { TeamMember } from '../team/TeamMember.model'
import {
  applicationParamsSchema,
  cardApplicationsParamsSchema,
  createApplicationSchema,
  decideApplicationSchema,
  updateApplicationSchema,
} from './application.schemas'
import { ApplicationDecision } from './ApplicationDecision.model'
import { ProjectApplication } from './ProjectApplication.model'

const r = Router()

const applicationStatusByDecision: Record<
  ApplicationDecisionStatus,
  ApplicationStatus
> = {
  [ApplicationDecisionStatus.INTERESTED]: ApplicationStatus.INTERESTED,
  [ApplicationDecisionStatus.ACCEPTED]: ApplicationStatus.ACCEPTED,
  [ApplicationDecisionStatus.REJECTED]: ApplicationStatus.REJECTED,
}

const serializeApplication = async (application: ProjectApplication) => {
  const [card, team, decision, memberships] = await Promise.all([
    ProjectCard.findByPk(application.card_id),
    Team.findByPk(application.team_id),
    ApplicationDecision.findOne({
      where: { application_id: application.id },
    }),
    TeamMember.findAll({
      where: {
        team_id: application.team_id,
        status: TeamMemberStatus.ACCEPTED,
      },
      include: [{ association: 'user', attributes: ['id', 'name', 'image'] }],
    }),
  ])
  const studentIds = memberships.map(({ user_id }) => user_id)
  const studentTags = await StudentTag.findAll({
    where: { student_id: { [Op.in]: studentIds } },
    include: [Tag],
  })

  return {
    application: application.toJSON(),
    card,
    team,
    decision,
    members: memberships.map((membership) => ({
      membership: membership.toJSON(),
      tags: studentTags
        .filter(({ student_id }) => student_id === membership.user_id)
        .map(({ tag }) => tag),
    })),
  }
}

const getOwnedApplication = async (applicationId: string, ownerId: string) => {
  const application = await ProjectApplication.findByPk(applicationId)
  if (!application) {
    return null
  }
  const card = await ProjectCard.findByPk(application.card_id)
  if (!card) {
    return null
  }
  const company = await Company.findOne({
    where: { id: card.company_id, owner_id: ownerId },
  })
  return company ? { application, card, company } : null
}

r.get('/mine', requireRole([UserRole.USER]), async (req, res) => {
  const memberships = await TeamMember.findAll({
    where: {
      user_id: req.user.id,
      status: TeamMemberStatus.ACCEPTED,
    },
    attributes: ['team_id'],
  })
  const teamIds = memberships.map(({ team_id }) => team_id)
  const applications = await ProjectApplication.findAll({
    where: { team_id: { [Op.in]: teamIds } },
    order: [['submitted_at', 'DESC']],
  })

  return res.json(
    await Promise.all(
      applications.map((application) => serializeApplication(application))
    )
  )
})

r.get(
  '/card/:cardId',
  requireRole([UserRole.BUSINESS]),
  validateRequest(cardApplicationsParamsSchema),
  async (req, res) => {
    const card = await ProjectCard.findByPk(req.params.cardId)
    if (!card) {
      return res.status(404).json({ message: 'card_not_found' })
    }
    const company = await Company.findOne({
      where: { id: card.company_id, owner_id: req.user.id },
    })
    if (!company) {
      return res.status(403).json({ message: 'card_owner_required' })
    }

    const applications = await ProjectApplication.findAll({
      where: { card_id: card.id },
      order: [['submitted_at', 'DESC']],
    })
    return res.json(
      await Promise.all(
        applications.map((application) => serializeApplication(application))
      )
    )
  }
)

r.post(
  '/',
  requireRole([UserRole.USER]),
  validateRequest(createApplicationSchema),
  async (req, res) => {
    const [card, team] = await Promise.all([
      ProjectCard.findByPk(req.body.card_id),
      Team.findByPk(req.body.team_id),
    ])

    if (!card || card.status !== CardStatus.PUBLISHED) {
      return res.status(400).json({ message: 'card_not_open' })
    }
    if (!team) {
      return res.status(404).json({ message: 'team_not_found' })
    }
    if (team.captain_id !== req.user.id) {
      return res.status(403).json({ message: 'captain_required' })
    }

    const existing = await ProjectApplication.findOne({
      where: { card_id: card.id, team_id: team.id },
    })
    if (existing) {
      return res.status(409).json({ message: 'application_already_exists' })
    }

    const application = await ProjectApplication.create({
      ...req.body,
      submitted_by: req.user.id,
    })
    return res.status(201).json(await serializeApplication(application))
  }
)

r.get(
  '/:applicationId',
  validateRequest(applicationParamsSchema),
  async (req, res) => {
    const application = await ProjectApplication.findByPk(
      req.params.applicationId
    )
    if (!application) {
      return res.status(404).json({ message: 'application_not_found' })
    }

    const [ownedApplication, membership] = await Promise.all([
      getOwnedApplication(application.id, req.user.id),
      TeamMember.findOne({
        where: {
          team_id: application.team_id,
          user_id: req.user.id,
          status: TeamMemberStatus.ACCEPTED,
        },
      }),
    ])
    if (!ownedApplication && !membership) {
      return res.status(403).json({ message: 'forbidden' })
    }

    return res.json(await serializeApplication(application))
  }
)

r.patch(
  '/:applicationId',
  requireRole([UserRole.USER]),
  validateRequest(updateApplicationSchema),
  async (req, res) => {
    const application = await ProjectApplication.findByPk(
      req.params.applicationId
    )
    if (!application) {
      return res.status(404).json({ message: 'application_not_found' })
    }
    const team = await Team.findByPk(application.team_id)
    if (!team || team.captain_id !== req.user.id) {
      return res.status(403).json({ message: 'captain_required' })
    }
    if (
      ![ApplicationStatus.PENDING, ApplicationStatus.INTERESTED].includes(
        application.status
      )
    ) {
      return res.status(409).json({ message: 'application_cannot_edit' })
    }

    await application.update(req.body)
    return res.json(await serializeApplication(application))
  }
)

r.post(
  '/:applicationId/decision',
  requireRole([UserRole.BUSINESS]),
  validateRequest(decideApplicationSchema),
  async (req, res) => {
    const owned = await getOwnedApplication(
      req.params.applicationId,
      req.user.id
    )
    if (!owned) {
      return res.status(404).json({ message: 'owned_application_not_found' })
    }
    if (
      [ApplicationStatus.COMPLETED, ApplicationStatus.WITHDRAWN].includes(
        owned.application.status
      )
    ) {
      return res.status(409).json({ message: 'application_is_final' })
    }

    const decision = await sequelize.transaction(async (transaction) => {
      const [storedDecision] = await ApplicationDecision.findOrCreate({
        where: { application_id: owned.application.id },
        defaults: {
          application_id: owned.application.id,
          decided_by: req.user.id,
          ...req.body,
        },
        transaction,
      })
      await storedDecision.update(
        {
          ...req.body,
          decided_by: req.user.id,
          decided_at: new Date(),
        },
        { transaction }
      )
      await owned.application.update(
        { status: applicationStatusByDecision[req.body.status] },
        { transaction }
      )
      if (req.body.status === ApplicationDecisionStatus.ACCEPTED) {
        await owned.card.update(
          { status: CardStatus.IN_PROGRESS },
          { transaction }
        )
      }
      return storedDecision
    })

    return res.json(decision)
  }
)

r.post(
  '/:applicationId/withdraw',
  requireRole([UserRole.USER]),
  validateRequest(applicationParamsSchema),
  async (req, res) => {
    const application = await ProjectApplication.findByPk(
      req.params.applicationId
    )
    if (!application) {
      return res.status(404).json({ message: 'application_not_found' })
    }
    const team = await Team.findByPk(application.team_id)
    if (!team || team.captain_id !== req.user.id) {
      return res.status(403).json({ message: 'captain_required' })
    }
    if (
      [ApplicationStatus.ACCEPTED, ApplicationStatus.COMPLETED].includes(
        application.status
      )
    ) {
      return res.status(409).json({ message: 'application_cannot_withdraw' })
    }

    await application.update({ status: ApplicationStatus.WITHDRAWN })
    return res.json(application)
  }
)

r.post(
  '/:applicationId/complete',
  requireRole([UserRole.BUSINESS]),
  validateRequest(applicationParamsSchema),
  async (req, res) => {
    const owned = await getOwnedApplication(
      req.params.applicationId,
      req.user.id
    )
    if (!owned) {
      return res.status(404).json({ message: 'owned_application_not_found' })
    }
    if (owned.application.status !== ApplicationStatus.ACCEPTED) {
      return res.status(409).json({ message: 'application_not_accepted' })
    }

    await sequelize.transaction(async (transaction) => {
      const application = await ProjectApplication.findByPk(
        owned.application.id,
        { lock: transaction.LOCK.UPDATE, transaction }
      )
      if (!application || application.status !== ApplicationStatus.ACCEPTED) {
        throw new Error('Application completion conflict')
      }

      const team = await Team.findByPk(application.team_id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })
      if (!team) {
        throw new Error('Application team is missing')
      }
      const reward = owned.card.reward_points
      team.points_balance += reward
      await team.save({ transaction })
      await TeamPointHistory.create(
        {
          team_id: team.id,
          application_id: application.id,
          amount: reward,
          balance_after: team.points_balance,
          reason: PointTransactionReason.PROJECT_COMPLETION,
        },
        { transaction }
      )

      const memberships = await TeamMember.findAll({
        where: {
          team_id: team.id,
          status: TeamMemberStatus.ACCEPTED,
        },
        transaction,
      })
      await Promise.all(
        memberships.map(async (membership) => {
          const student = await StudentProfile.findByPk(membership.user_id, {
            lock: transaction.LOCK.UPDATE,
            transaction,
          })
          if (!student) {
            throw new Error('Team member student profile is missing')
          }
          student.points_balance += reward
          await student.save({ transaction })
          await StudentPointHistory.create(
            {
              student_id: student.user_id,
              application_id: application.id,
              amount: reward,
              balance_after: student.points_balance,
              reason: PointTransactionReason.PROJECT_COMPLETION,
            },
            { transaction }
          )
        })
      )

      await application.update(
        { status: ApplicationStatus.COMPLETED },
        { transaction }
      )
      await owned.card.update(
        { status: CardStatus.COMPLETED, completed_at: new Date() },
        { transaction }
      )
    })

    const completedApplication = await ProjectApplication.findByPk(
      owned.application.id
    )
    if (!completedApplication) {
      return res.status(500).json({ message: 'application_completion_failed' })
    }
    return res.json(await serializeApplication(completedApplication))
  }
)

export { r as applicationRouter }
