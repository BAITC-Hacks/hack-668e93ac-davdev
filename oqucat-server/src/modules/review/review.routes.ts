import { Router } from 'express'

import requireRole from '../../middleware/requireRole'
import { validateRequest } from '../../middleware/validateRequest'
import { ApplicationStatus } from '../../types/ApplicationStatus'
import { TeamMemberStatus } from '../../types/TeamMemberStatus'
import { UserRole } from '../../types/UserRole'
import { ProjectApplication } from '../application/ProjectApplication.model'
import { ProjectCard } from '../card/ProjectCard.model'
import { Company } from '../company/Company.model'
import { TeamMember } from '../team/TeamMember.model'
import { User } from '../user/User.model'
import { Review } from './Review.model'
import {
  applicationReviewsSchema,
  createReviewSchema,
  studentReviewsSchema,
  teamReviewsSchema,
} from './review.schemas'

const r = Router()

const withSummary = (reviews: Review[]) => {
  const total = reviews.reduce((sum, review) => sum + review.rating, 0)
  return {
    reviews,
    average_rating: reviews.length > 0 ? total / reviews.length : null,
    reviews_count: reviews.length,
  }
}

r.post(
  '/application/:applicationId',
  requireRole([UserRole.BUSINESS]),
  validateRequest(createReviewSchema),
  async (req, res) => {
    const application = await ProjectApplication.findByPk(
      req.params.applicationId
    )
    if (!application || application.status !== ApplicationStatus.COMPLETED) {
      return res.status(400).json({ message: 'completed_application_required' })
    }
    const card = await ProjectCard.findByPk(application.card_id)
    if (!card) {
      return res.status(404).json({ message: 'card_not_found' })
    }
    const company = await Company.findOne({
      where: { id: card.company_id, owner_id: req.user.id },
    })
    if (!company) {
      return res.status(403).json({ message: 'card_owner_required' })
    }
    const membership = await TeamMember.findOne({
      where: {
        team_id: application.team_id,
        user_id: req.body.student_id,
        status: TeamMemberStatus.ACCEPTED,
      },
    })
    if (!membership) {
      return res.status(400).json({ message: 'student_not_in_team' })
    }
    const existing = await Review.findOne({
      where: {
        application_id: application.id,
        student_id: req.body.student_id,
      },
    })
    if (existing) {
      return res.status(409).json({ message: 'review_already_exists' })
    }

    const review = await Review.create({
      ...req.body,
      student_id: req.body.student_id,
      company_id: company.id,
      application_id: application.id,
      team_id: application.team_id,
    })
    return res.status(201).json(review)
  }
)

r.get(
  '/student/:studentId',
  validateRequest(studentReviewsSchema),
  async (req, res) => {
    const reviews = await Review.findAll({
      where: { student_id: req.params.studentId },
      include: [Company],
      order: [['createdAt', 'DESC']],
    })
    const student = await User.findByPk(req.params.studentId, {
      attributes: ['id', 'name', 'image'],
    })
    if (!student) {
      return res.status(404).json({ message: 'student_not_found' })
    }
    return res.json({ student, ...withSummary(reviews) })
  }
)

r.get('/team/:teamId', validateRequest(teamReviewsSchema), async (req, res) => {
  const reviews = await Review.findAll({
    where: { team_id: req.params.teamId },
    include: [Company],
    order: [['createdAt', 'DESC']],
  })
  return res.json(withSummary(reviews))
})

r.get(
  '/application/:applicationId',
  validateRequest(applicationReviewsSchema),
  async (req, res) => {
    const reviews = await Review.findAll({
      where: { application_id: req.params.applicationId },
      include: [Company, User],
      order: [['createdAt', 'DESC']],
    })
    return res.json(withSummary(reviews))
  }
)

export { r as reviewRouter }
