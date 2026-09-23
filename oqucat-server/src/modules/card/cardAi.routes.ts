import { Router } from 'express'

import { logger } from '../../logger'
import requireRole from '../../middleware/requireRole'
import { validateRequest } from '../../middleware/validateRequest'
import { UserRole } from '../../types/UserRole'
import { Company } from '../company/Company.model'
import { cardParamsSchema, createAiProjectCardSchema } from './card.schemas'
import { createCardSnapshot, findOwnedCard, serializeCard } from './card.utils'
import { ProjectCard } from './ProjectCard.model'
import { generateProjectClarifications } from './projectCardClarification.service'
import { generateProjectCardDraft } from './projectCardDraft.service'
import { ProjectClarification } from './ProjectClarification.model'

const r = Router()

r.post(
  '/drafts/ai',
  requireRole([UserRole.BUSINESS]),
  validateRequest(createAiProjectCardSchema),
  async (req, res) => {
    const company = await Company.findOne({
      where: { owner_id: req.user.id },
    })
    if (!company) {
      return res.status(403).json({ message: 'company_profile_required' })
    }

    try {
      const generatedCard = await generateProjectCardDraft(
        { description: req.body.description },
        req.user.email
      )
      const card = await ProjectCard.create({
        ...generatedCard,
        company_id: company.id,
        creation_method: req.body.creation_method,
      })
      return res.status(201).json(await serializeCard(card))
    } catch (error) {
      logger.error({ error }, 'AI project card generation failed')
      return res.status(502).json({ message: 'card_generation_failed' })
    }
  }
)

r.post(
  '/:cardId/clarifications/apply',
  requireRole([UserRole.BUSINESS]),
  validateRequest(cardParamsSchema),
  async (req, res) => {
    const card = await findOwnedCard(req.params.cardId, req.user.id)
    if (!card) {
      return res.status(404).json({ message: 'owned_card_not_found' })
    }
    const clarifications = await ProjectClarification.findAll({
      where: { card_id: card.id },
      order: [['sequence', 'ASC']],
    })
    if (clarifications.length === 0) {
      return res.status(400).json({ message: 'clarifications_required' })
    }

    try {
      const generatedCard = await generateProjectCardDraft(
        {
          card: await createCardSnapshot(card),
          clarifications: clarifications.map((item) => item.toJSON()),
        },
        req.user.email
      )
      await card.update(generatedCard)
      return res.json(await serializeCard(card))
    } catch (error) {
      logger.error({ cardId: card.id, error }, 'Applying clarifications failed')
      return res.status(502).json({ message: 'clarification_apply_failed' })
    }
  }
)

r.post(
  '/:cardId/clarifications/generate',
  requireRole([UserRole.BUSINESS]),
  validateRequest(cardParamsSchema),
  async (req, res) => {
    const card = await findOwnedCard(req.params.cardId, req.user.id)
    if (!card) {
      return res.status(404).json({ message: 'owned_card_not_found' })
    }

    try {
      const questions = await generateProjectClarifications(
        await createCardSnapshot(card),
        req.user.email
      )
      const firstSequence =
        (await ProjectClarification.max('sequence', {
          where: { card_id: card.id },
        })) ?? 0
      const clarifications = await ProjectClarification.bulkCreate(
        questions.map((question, index) => ({
          card_id: card.id,
          question,
          sequence: Number(firstSequence) + index + 1,
        }))
      )
      return res.status(201).json(clarifications)
    } catch (error) {
      logger.error(
        { cardId: card.id, error },
        'Clarification generation failed'
      )
      return res
        .status(502)
        .json({ message: 'clarification_generation_failed' })
    }
  }
)

export { r as cardAiRouter }
