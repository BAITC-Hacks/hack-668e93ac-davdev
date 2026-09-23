import { z } from 'zod'

import type { UserID } from '../../types/UserId'
import { Company } from '../company/Company.model'
import { Tag } from '../tag/Tag.model'
import { ProjectCard } from './ProjectCard.model'
import { ProjectCardField } from './ProjectCardField.model'
import type { ProjectCardSnapshot } from './ProjectCardReview.model'
import { ProjectCardTag } from './ProjectCardTag.model'

const projectCardSnapshotSchema = z.record(z.string(), z.json())

export const findOwnedCard = async (cardId: string, ownerId: UserID) => {
  const company = await Company.findOne({ where: { owner_id: ownerId } })

  if (!company) {
    return null
  }

  return ProjectCard.findOne({ where: { id: cardId, company_id: company.id } })
}

export const serializeCard = async (card: ProjectCard) => {
  const [company, fields, cardTags] = await Promise.all([
    Company.findByPk(card.company_id),
    ProjectCardField.findAll({
      where: { card_id: card.id },
      order: [
        ['position', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    }),
    ProjectCardTag.findAll({
      where: { card_id: card.id },
      include: [Tag],
    }),
  ])

  return {
    card: card.toJSON(),
    company,
    fields,
    tags: cardTags.map(({ tag }) => tag),
  }
}

export const createCardSnapshot = async (
  card: ProjectCard
): Promise<ProjectCardSnapshot> => {
  const details = await serializeCard(card)
  const serializedDetails = JSON.stringify(details)
  const parsedDetails: unknown = JSON.parse(serializedDetails)
  return projectCardSnapshotSchema.parse(parsedDetails)
}
