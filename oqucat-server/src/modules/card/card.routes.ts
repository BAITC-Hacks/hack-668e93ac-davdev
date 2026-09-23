import { Router } from 'express'
import { Op, type Order, type WhereOptions } from 'sequelize'

import sequelize from '../../db'
import { logger } from '../../logger'
import requireRole from '../../middleware/requireRole'
import { validateRequest } from '../../middleware/validateRequest'
import { CardStatus } from '../../types/CardStatus'
import { UserRole } from '../../types/UserRole'
import { Company } from '../company/Company.model'
import { Tag } from '../tag/Tag.model'
import {
  cardParamsSchema,
  cardReviewParamsSchema,
  createClarificationSchema,
  createProjectCardSchema,
  listProjectCardsSchema,
  updateCardFieldsSchema,
  updateCardTagsSchema,
  updateClarificationSchema,
  updateProjectCardSchema,
} from './card.schemas'
import { createCardSnapshot, findOwnedCard, serializeCard } from './card.utils'
import { cardAiRouter } from './cardAi.routes'
import { ProjectCard } from './ProjectCard.model'
import { ProjectCardField } from './ProjectCardField.model'
import { ProjectCardReview } from './ProjectCardReview.model'
import { completeProjectCardReview } from './projectCardReview.service'
import { ProjectCardTag } from './ProjectCardTag.model'
import { ProjectClarification } from './ProjectClarification.model'

const r = Router()
r.use(cardAiRouter)

const validateTagIds = async (tagIds: string[]) => {
  const uniqueTagIds = [...new Set(tagIds)]
  const count = await Tag.count({ where: { id: uniqueTagIds } })
  return count === uniqueTagIds.length ? uniqueTagIds : null
}

r.get('/catalog', validateRequest(listProjectCardsSchema), async (req, res) => {
  const {
    page,
    limit,
    search,
    tag_id: tagId,
    min_completeness: minimum,
    max_completeness: maximum,
    sort,
  } = req.query
  const scoreWhere = {
    ...(minimum === undefined ? {} : { [Op.gte]: minimum }),
    ...(maximum === undefined ? {} : { [Op.lte]: maximum }),
  }
  let taggedCardIds: string[] | undefined

  if (tagId) {
    const cardTags = await ProjectCardTag.findAll({
      where: { tag_id: tagId },
      attributes: ['card_id'],
    })
    taggedCardIds = cardTags.map(({ card_id }) => card_id)
  }

  const where: WhereOptions = {
    status: CardStatus.PUBLISHED,
    ...(Object.getOwnPropertySymbols(scoreWhere).length > 0
      ? { completeness_score: scoreWhere }
      : {}),
    ...(search
      ? {
          [Op.or]: [
            { title: { [Op.iLike]: `%${search}%` } },
            { context: { [Op.iLike]: `%${search}%` } },
            { need: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : {}),
    ...(taggedCardIds ? { id: { [Op.in]: taggedCardIds } } : {}),
  }
  const order: Order =
    sort === 'newest'
      ? [['published_at', 'DESC']]
      : [
          ['completeness_score', 'DESC'],
          ['published_at', 'DESC'],
        ]
  const { count, rows } = await ProjectCard.findAndCountAll({
    where,
    order,
    limit,
    offset: (page - 1) * limit,
  })

  return res.json({
    cards: await Promise.all(rows.map((card) => serializeCard(card))),
    page,
    limit,
    total: count,
    pages: Math.ceil(count / limit),
  })
})

r.get('/mine', requireRole([UserRole.BUSINESS]), async (req, res) => {
  const company = await Company.findOne({ where: { owner_id: req.user.id } })

  if (!company) {
    return res.status(404).json({ message: 'company_not_found' })
  }

  const cards = await ProjectCard.findAll({
    where: { company_id: company.id },
    order: [['createdAt', 'DESC']],
  })
  return res.json(await Promise.all(cards.map((card) => serializeCard(card))))
})

r.post(
  '/',
  requireRole([UserRole.BUSINESS]),
  validateRequest(createProjectCardSchema),
  async (req, res) => {
    const company = await Company.findOne({ where: { owner_id: req.user.id } })

    if (!company) {
      return res.status(403).json({ message: 'company_profile_required' })
    }

    const { fields = [], tag_ids: requestedTagIds = [], ...cardData } = req.body
    const tagIds = await validateTagIds(requestedTagIds)

    if (!tagIds) {
      return res.status(400).json({ message: 'invalid_tags' })
    }
    if (new Set(fields.map(({ key }) => key)).size !== fields.length) {
      return res.status(400).json({ message: 'duplicate_field_keys' })
    }

    const card = await sequelize.transaction(async (transaction) => {
      const createdCard = await ProjectCard.create(
        { ...cardData, company_id: company.id },
        { transaction }
      )
      await ProjectCardField.bulkCreate(
        fields.map(({ field_type, key, label, position, value }) => ({
          field_type,
          key,
          label,
          position,
          value: value ?? null,
          card_id: createdCard.id,
        })),
        { transaction }
      )
      await ProjectCardTag.bulkCreate(
        tagIds.map((tagId) => ({ card_id: createdCard.id, tag_id: tagId })),
        { transaction }
      )
      return createdCard
    })

    return res.status(201).json(await serializeCard(card))
  }
)

r.get('/:cardId', validateRequest(cardParamsSchema), async (req, res) => {
  const card = await ProjectCard.findByPk(req.params.cardId)

  if (!card) {
    return res.status(404).json({ message: 'card_not_found' })
  }
  const isOwner = Boolean(await findOwnedCard(card.id, req.user.id))
  if (
    !isOwner &&
    [CardStatus.DRAFT, CardStatus.CANCELLED].includes(card.status)
  ) {
    return res.status(403).json({ message: 'forbidden' })
  }

  return res.json(await serializeCard(card))
})

r.patch(
  '/:cardId',
  requireRole([UserRole.BUSINESS]),
  validateRequest(updateProjectCardSchema),
  async (req, res) => {
    const card = await findOwnedCard(req.params.cardId, req.user.id)

    if (!card) {
      return res.status(404).json({ message: 'owned_card_not_found' })
    }

    await card.update(req.body)
    return res.json(await serializeCard(card))
  }
)

r.put(
  '/:cardId/tags',
  requireRole([UserRole.BUSINESS]),
  validateRequest(updateCardTagsSchema),
  async (req, res) => {
    const card = await findOwnedCard(req.params.cardId, req.user.id)

    if (!card) {
      return res.status(404).json({ message: 'owned_card_not_found' })
    }

    const tagIds = await validateTagIds(req.body.tag_ids)
    if (!tagIds) {
      return res.status(400).json({ message: 'invalid_tags' })
    }

    await sequelize.transaction(async (transaction) => {
      await ProjectCardTag.destroy({
        where: { card_id: card.id },
        transaction,
      })
      await ProjectCardTag.bulkCreate(
        tagIds.map((tagId) => ({ card_id: card.id, tag_id: tagId })),
        { transaction }
      )
    })
    return res.json(await serializeCard(card))
  }
)

r.put(
  '/:cardId/fields',
  requireRole([UserRole.BUSINESS]),
  validateRequest(updateCardFieldsSchema),
  async (req, res) => {
    const card = await findOwnedCard(req.params.cardId, req.user.id)
    if (!card) {
      return res.status(404).json({ message: 'owned_card_not_found' })
    }
    if (
      new Set(req.body.fields.map(({ key }) => key)).size !==
      req.body.fields.length
    ) {
      return res.status(400).json({ message: 'duplicate_field_keys' })
    }

    await sequelize.transaction(async (transaction) => {
      await ProjectCardField.destroy({
        where: { card_id: card.id },
        transaction,
      })
      await ProjectCardField.bulkCreate(
        req.body.fields.map(({ field_type, key, label, position, value }) => ({
          field_type,
          key,
          label,
          position,
          value: value ?? null,
          card_id: card.id,
        })),
        { transaction }
      )
    })
    return res.json(await serializeCard(card))
  }
)

r.post(
  '/:cardId/publish',
  requireRole([UserRole.BUSINESS]),
  validateRequest(cardParamsSchema),
  async (req, res) => {
    const card = await findOwnedCard(req.params.cardId, req.user.id)
    if (!card) {
      return res.status(404).json({ message: 'owned_card_not_found' })
    }

    await card.update({
      status: CardStatus.PUBLISHED,
      published_at: card.published_at ?? new Date(),
    })
    return res.json(await serializeCard(card))
  }
)

r.post(
  '/:cardId/cancel',
  requireRole([UserRole.BUSINESS]),
  validateRequest(cardParamsSchema),
  async (req, res) => {
    const card = await findOwnedCard(req.params.cardId, req.user.id)
    if (!card) {
      return res.status(404).json({ message: 'owned_card_not_found' })
    }
    if (card.status === CardStatus.COMPLETED) {
      return res.status(409).json({ message: 'completed_card_cannot_cancel' })
    }

    await card.update({ status: CardStatus.CANCELLED })
    return res.json(await serializeCard(card))
  }
)

r.post(
  '/:cardId/clarifications',
  requireRole([UserRole.BUSINESS]),
  validateRequest(createClarificationSchema),
  async (req, res) => {
    const card = await findOwnedCard(req.params.cardId, req.user.id)
    if (!card) {
      return res.status(404).json({ message: 'owned_card_not_found' })
    }

    const sequence = await ProjectClarification.count({
      where: { card_id: card.id },
    })
    const clarification = await ProjectClarification.create({
      card_id: card.id,
      question: req.body.question,
      sequence: sequence + 1,
    })
    return res.status(201).json(clarification)
  }
)

r.get(
  '/:cardId/clarifications',
  validateRequest(cardParamsSchema),
  async (req, res) => {
    const card = await ProjectCard.findByPk(req.params.cardId)
    if (!card) {
      return res.status(404).json({ message: 'card_not_found' })
    }
    if (
      [CardStatus.DRAFT, CardStatus.CANCELLED].includes(card.status) &&
      !(await findOwnedCard(card.id, req.user.id))
    ) {
      return res.status(403).json({ message: 'forbidden' })
    }

    return res.json(
      await ProjectClarification.findAll({
        where: { card_id: card.id },
        order: [['sequence', 'ASC']],
      })
    )
  }
)

r.patch(
  '/:cardId/clarifications/:clarificationId',
  requireRole([UserRole.BUSINESS]),
  validateRequest(updateClarificationSchema),
  async (req, res) => {
    const card = await findOwnedCard(req.params.cardId, req.user.id)
    if (!card) {
      return res.status(404).json({ message: 'owned_card_not_found' })
    }
    const clarification = await ProjectClarification.findOne({
      where: { id: req.params.clarificationId, card_id: card.id },
    })
    if (!clarification) {
      return res.status(404).json({ message: 'clarification_not_found' })
    }

    await clarification.update(req.body)
    return res.json(clarification)
  }
)

r.get(
  '/:cardId/reviews',
  requireRole([UserRole.BUSINESS]),
  validateRequest(cardParamsSchema),
  async (req, res) => {
    const card = await ProjectCard.findByPk(req.params.cardId)
    if (!card) {
      return res.status(404).json({ message: 'card_not_found' })
    }
    if (
      [CardStatus.DRAFT, CardStatus.CANCELLED].includes(card.status) &&
      !(await findOwnedCard(card.id, req.user.id))
    ) {
      return res.status(403).json({ message: 'forbidden' })
    }

    return res.json(
      await ProjectCardReview.findAll({
        where: { card_id: card.id },
        order: [['createdAt', 'DESC']],
      })
    )
  }
)

r.post(
  '/:cardId/reviews',
  requireRole([UserRole.BUSINESS]),
  validateRequest(cardParamsSchema),
  async (req, res) => {
    const card = await findOwnedCard(req.params.cardId, req.user.id)
    if (!card) {
      return res.status(404).json({ message: 'owned_card_not_found' })
    }

    const review = await ProjectCardReview.create({
      card_id: card.id,
      requested_by: req.user.id,
      card_copy: await createCardSnapshot(card),
    })
    review.requester = req.user

    try {
      await completeProjectCardReview(review, card)
      return res.status(201).json(review)
    } catch (error) {
      logger.error({ error, reviewId: review.id }, 'Project card review failed')
      return res.status(502).json({
        message: 'card_review_failed',
        review_id: review.id,
      })
    }
  }
)

r.post(
  '/:cardId/reviews/:reviewId/retry',
  requireRole([UserRole.BUSINESS]),
  validateRequest(cardReviewParamsSchema),
  async (req, res) => {
    const card = await findOwnedCard(req.params.cardId, req.user.id)
    if (!card) {
      return res.status(404).json({ message: 'owned_card_not_found' })
    }
    const review = await ProjectCardReview.findOne({
      where: { id: req.params.reviewId, card_id: card.id },
    })
    if (!review) {
      return res.status(404).json({ message: 'card_review_not_found' })
    }
    review.requester = req.user

    try {
      await completeProjectCardReview(review, card)
      return res.json(review)
    } catch (error) {
      logger.error({ error, reviewId: review.id }, 'Card review retry failed')
      return res.status(502).json({ message: 'card_review_failed' })
    }
  }
)

export { r as cardRouter }
