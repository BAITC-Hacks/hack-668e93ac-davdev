import { Router } from 'express'
import { Op } from 'sequelize'

import requireRole from '../../middleware/requireRole'
import { validateRequest } from '../../middleware/validateRequest'
import { CardStatus } from '../../types/CardStatus'
import { UserRole } from '../../types/UserRole'
import { ProjectCard } from '../card/ProjectCard.model'
import { StudentProfile } from '../student/StudentProfile.model'
import { Company } from './Company.model'
import {
  companyParamsSchema,
  createCompanySchema,
  updateCompanySchema,
} from './company.schemas'

const r = Router()

const getCompanyStats = async (companyId: string) => {
  const cards = await ProjectCard.findAll({
    where: { company_id: companyId },
    attributes: ['status', 'completeness_score'],
  })
  const publishedCards = cards.filter(
    ({ status }) => status !== CardStatus.DRAFT
  )
  const ratingTotal = publishedCards.reduce(
    (total, card) => total + card.completeness_score,
    0
  )

  return {
    cards_count: cards.length,
    published_cards_count: publishedCards.length,
    completed_cards_count: cards.filter(
      ({ status }) => status === CardStatus.COMPLETED
    ).length,
    average_card_completeness:
      publishedCards.length > 0
        ? Math.round(ratingTotal / publishedCards.length)
        : 0,
  }
}

r.get('/me', requireRole([UserRole.BUSINESS]), async (req, res) => {
  const company = await Company.findOne({ where: { owner_id: req.user.id } })

  if (!company) {
    return res.status(404).json({ message: 'company_not_found' })
  }

  return res.json({
    company: company.toJSON(),
    stats: await getCompanyStats(company.id),
  })
})

r.post(
  '/',
  requireRole([UserRole.BUSINESS]),
  validateRequest(createCompanySchema),
  async (req, res) => {
    const [existingCompany, studentProfile] = await Promise.all([
      Company.findOne({ where: { owner_id: req.user.id } }),
      StudentProfile.findByPk(req.user.id),
    ])

    if (existingCompany) {
      return res.status(409).json({ message: 'company_already_exists' })
    }
    if (studentProfile) {
      return res.status(409).json({ message: 'account_is_student' })
    }

    const company = await Company.create({
      ...req.body,
      owner_id: req.user.id,
    })

    return res.status(201).json(company)
  }
)

r.patch(
  '/me',
  requireRole([UserRole.BUSINESS]),
  validateRequest(updateCompanySchema),
  async (req, res) => {
    const company = await Company.findOne({
      where: { owner_id: req.user.id },
    })

    if (!company) {
      return res.status(404).json({ message: 'company_not_found' })
    }

    await company.update(req.body)
    return res.json(company)
  }
)

r.get(
  '/:companyId/cards',
  validateRequest(companyParamsSchema),
  async (req, res) => {
    const company = await Company.findByPk(req.params.companyId)
    if (!company) {
      return res.status(404).json({ message: 'company_not_found' })
    }

    const cards = await ProjectCard.findAll({
      where: {
        company_id: company.id,
        status: { [Op.notIn]: [CardStatus.DRAFT, CardStatus.CANCELLED] },
      },
      order: [['published_at', 'DESC']],
    })
    return res.json(cards)
  }
)

r.get('/:companyId', validateRequest(companyParamsSchema), async (req, res) => {
  const company = await Company.findByPk(req.params.companyId)

  if (!company) {
    return res.status(404).json({ message: 'company_not_found' })
  }

  return res.json({
    company: company.toJSON(),
    stats: await getCompanyStats(company.id),
  })
})

export { r as companyRouter }
