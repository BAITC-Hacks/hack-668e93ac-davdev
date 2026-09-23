import { z } from 'zod'

import { CardCreationMethod } from '../../types/CardCreationMethod'
import { DynamicFieldType } from '../../types/DynamicFieldType'

const nullableText = (maximum: number) =>
  z.string().trim().max(maximum).nullish()

const editableCardFields = {
  title: z.string().trim().min(1).max(200),
  context: nullableText(10_000),
  need: nullableText(10_000),
  target_users: nullableText(5000),
  data: nullableText(10_000),
  constraints: nullableText(10_000),
  expected_result: nullableText(10_000),
  success_criteria: nullableText(10_000),
  contact: nullableText(2000),
  interaction_format: nullableText(5000),
  creation_method: z.enum(CardCreationMethod).optional(),
}

export const projectCardFieldSchema = z
  .object({
    key: z.string().trim().min(1).max(100),
    label: z.string().trim().min(1).max(200),
    value: z.json().optional(),
    field_type: z.enum(DynamicFieldType).optional(),
    position: z.number().int().min(0).optional(),
  })
  .superRefine(({ field_type = DynamicFieldType.TEXT, value }, context) => {
    if (value === undefined || value === null) {
      return
    }
    const textTypes = [
      DynamicFieldType.TEXT,
      DynamicFieldType.DATE,
      DynamicFieldType.URL,
    ]
    const valid =
      field_type === DynamicFieldType.JSON ||
      (field_type === DynamicFieldType.NUMBER &&
        typeof value === 'number' &&
        Number.isFinite(value)) ||
      (field_type === DynamicFieldType.BOOLEAN && typeof value === 'boolean') ||
      (textTypes.includes(field_type) &&
        typeof value === 'string' &&
        value.length <= 10_000)
    if (!valid) {
      context.addIssue({
        code: 'custom',
        message: 'Value does not match field type',
        path: ['value'],
      })
    }
  })
  .superRefine(({ field_type, value }, context) => {
    if (
      field_type === DynamicFieldType.URL &&
      typeof value === 'string' &&
      value
    ) {
      try {
        if (!['http:', 'https:'].includes(new URL(value).protocol)) {
          throw new Error('invalid_url')
        }
      } catch {
        context.addIssue({
          code: 'custom',
          message: 'Invalid HTTP URL',
          path: ['value'],
        })
      }
    }
    if (
      field_type === DynamicFieldType.DATE &&
      typeof value === 'string' &&
      value &&
      (!/^\d{4}-\d{2}-\d{2}$/u.test(value) ||
        !Number.isFinite(Date.parse(value)) ||
        new Date(value).toISOString().slice(0, 10) !== value)
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Invalid date',
        path: ['value'],
      })
    }
  })

export const createProjectCardSchema = {
  body: z.object({
    ...editableCardFields,
    tag_ids: z.array(z.uuid()).max(50).optional(),
    fields: z.array(projectCardFieldSchema).max(100).optional(),
  }),
}

export const createAiProjectCardSchema = {
  body: z.object({
    description: z.string().trim().min(10).max(20_000),
    creation_method: z
      .enum([CardCreationMethod.TEXT_CHAT, CardCreationMethod.VOICE_ASSISTANT])
      .default(CardCreationMethod.TEXT_CHAT),
  }),
}

export const updateProjectCardSchema = {
  params: z.object({ cardId: z.uuid() }),
  body: createProjectCardSchema.body.partial(),
}

export const cardParamsSchema = {
  params: z.object({ cardId: z.uuid() }),
}

export const publishCardSchema = {
  params: cardParamsSchema.params,
  body: z.object({ review_id: z.uuid(), confirmed: z.literal(true) }),
}

export const listProjectCardsSchema = {
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(200).optional(),
    tag_id: z.uuid().optional(),
    min_completeness: z.coerce.number().int().min(0).max(100).optional(),
    max_completeness: z.coerce.number().int().min(0).max(100).optional(),
    sort: z.enum(['completeness', 'newest']).default('completeness'),
  }),
}

export const updateCardTagsSchema = {
  params: cardParamsSchema.params,
  body: z.object({ tag_ids: z.array(z.uuid()).max(50) }),
}

export const updateCardFieldsSchema = {
  params: cardParamsSchema.params,
  body: z.object({ fields: z.array(projectCardFieldSchema).max(100) }),
}

export const createClarificationSchema = {
  params: cardParamsSchema.params,
  body: z.object({
    question: z.string().trim().min(1).max(5000),
  }),
}

export const updateClarificationSchema = {
  params: z.object({ cardId: z.uuid(), clarificationId: z.uuid() }),
  body: z.object({
    answer: z.string().trim().max(10_000).nullable(),
    completeness_score: z.number().int().min(0).max(100).optional(),
  }),
}

export const cardReviewParamsSchema = {
  params: z.object({ cardId: z.uuid(), reviewId: z.uuid() }),
}
