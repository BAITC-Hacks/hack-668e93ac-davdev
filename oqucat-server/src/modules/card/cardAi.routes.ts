import { Router } from 'express'
import { toFile } from 'openai'

import cfg from '../../config'
import sequelize from '../../db'
import { logger } from '../../logger'
import requireRole from '../../middleware/requireRole'
import { validateRequest } from '../../middleware/validateRequest'
import { CardStatus } from '../../types/CardStatus'
import { UserRole } from '../../types/UserRole'
import { Company } from '../company/Company.model'
import { generateVoice } from '../llm/generateVoice'
import { openai } from '../llm/openai'
import {
  cardParamsSchema,
  createAiProjectCardSchema,
  updateClarificationSchema,
} from './card.schemas'
import { createCardSnapshot, findOwnedCard, serializeCard } from './card.utils'
import { sameCardContent } from './cardContent'
import { ProjectCard } from './ProjectCard.model'
import { generateProjectClarifications } from './projectCardClarification.service'
import { generateProjectCardDraft } from './projectCardDraft.service'
import { ProjectCardField } from './ProjectCardField.model'
import { ProjectClarification } from './ProjectClarification.model'

const r = Router()

r.post(
  '/:cardId/clarifications/:clarificationId/voice',
  requireRole([UserRole.BUSINESS]),
  validateRequest({ params: updateClarificationSchema.params }),
  async (req, res) => {
    const card = await findOwnedCard(req.params.cardId, req.user.id)
    if (!card) {
      return res.status(404).json({ message: 'owned_card_not_found' })
    }
    const question = await ProjectClarification.findOne({
      where: { id: req.params.clarificationId, card_id: card.id },
    })
    if (!question) {
      return res.status(404).json({ message: 'clarification_not_found' })
    }
    try {
      return res.type('audio/mpeg').send(await generateVoice(question.question))
    } catch (error) {
      logger.error({ error, cardId: card.id }, 'Card question speech failed')
      return res.status(502).json({ message: 'card_voice_failed' })
    }
  }
)

r.post('/transcribe', requireRole([UserRole.BUSINESS]), async (req, res) => {
  const audio = req.files?.audio
  if (
    !audio ||
    Array.isArray(audio) ||
    audio.truncated ||
    audio.size > 10 * 1024 * 1024 ||
    ![
      'audio/webm',
      'video/webm',
      'audio/ogg',
      'audio/mp4',
      'audio/mpeg',
      'audio/wav',
    ].includes(audio.mimetype.split(';')[0])
  ) {
    return res.status(400).json({ message: 'invalidfile' })
  }
  try {
    const result = await openai.audio.transcriptions.create({
      file: await toFile(audio.data, audio.name, { type: audio.mimetype }),
      model: cfg.LLM_TRANSCRIPTION_MODEL,
      language: req.user.locale,
    })
    if (!result.text.trim() || result.text.length > 20_000) {
      return res.status(400).json({ message: 'invalidfile' })
    }
    return res.json({ text: result.text.trim() })
  } catch (error) {
    logger.error({ error }, 'Card audio transcription failed')
    return res.status(502).json({ message: 'card_transcription_failed' })
  }
})

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
        { description: req.body.description, language: req.user.locale },
        req.user.email
      )
      const { fields, ...cardData } = generatedCard
      const card = await sequelize.transaction(async (transaction) => {
        const created = await ProjectCard.create(
          {
            ...cardData,
            company_id: company.id,
            creation_method: req.body.creation_method,
          },
          { transaction }
        )
        await ProjectCardField.bulkCreate(
          fields.map((field) => ({
            ...field,
            value: field.value ?? null,
            card_id: created.id,
          })),
          { transaction }
        )
        return created
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
    if (card.status !== CardStatus.DRAFT) {
      return res.status(409).json({ message: 'card_not_editable' })
    }
    const clarifications = await ProjectClarification.findAll({
      where: { card_id: card.id },
      order: [['sequence', 'ASC']],
    })
    if (!clarifications.some(({ answer }) => answer?.trim())) {
      return res.status(400).json({ message: 'clarifications_required' })
    }

    try {
      const snapshot = await createCardSnapshot(card)
      const generatedCard = await generateProjectCardDraft(
        {
          card: snapshot,
          language: req.user.locale,
          clarifications: clarifications.map((item) => item.toJSON()),
        },
        req.user.email
      )
      const { fields, ...cardData } = generatedCard
      const applied = await sequelize.transaction(async (transaction) => {
        await card.reload({ transaction, lock: transaction.LOCK.UPDATE })
        if (
          card.status !== CardStatus.DRAFT ||
          !sameCardContent(
            snapshot,
            await createCardSnapshot(card, transaction)
          )
        ) {
          return false
        }
        await card.update(
          { ...cardData, completeness_score: 0, reward_points: 0 },
          { transaction }
        )
        await ProjectCardField.destroy({
          where: { card_id: card.id },
          transaction,
        })
        await ProjectCardField.bulkCreate(
          fields.map((field) => ({
            ...field,
            value: field.value ?? null,
            card_id: card.id,
          })),
          { transaction }
        )
        return true
      })
      if (!applied) {
        return res.status(409).json({ message: 'card_changed' })
      }
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
      const existing = await ProjectClarification.findAll({
        where: { card_id: card.id },
        order: [['sequence', 'ASC']],
      })
      const pending = existing.filter(({ answer }) => !answer?.trim())
      if (pending.length > 0) {
        return res.json(pending)
      }
      const questions = await generateProjectClarifications(
        {
          ...(await createCardSnapshot(card)),
          language: req.user.locale,
          previous_questions: existing.map(({ question }) => question),
        },
        req.user.email
      )
      const clarifications = await sequelize.transaction(
        async (transaction) => {
          await card.reload({ transaction, lock: transaction.LOCK.UPDATE })
          const current = await ProjectClarification.findAll({
            where: { card_id: card.id },
            transaction,
          })
          const unanswered = current.filter(({ answer }) => !answer?.trim())
          if (unanswered.length) {
            return unanswered
          }
          const firstSequence = Math.max(
            0,
            ...current.map(({ sequence }) => sequence)
          )
          return ProjectClarification.bulkCreate(
            questions.map((question, index) => ({
              card_id: card.id,
              question,
              sequence: firstSequence + index + 1,
            })),
            { transaction }
          )
        }
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
