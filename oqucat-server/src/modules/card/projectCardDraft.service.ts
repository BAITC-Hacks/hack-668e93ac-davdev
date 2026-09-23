import { z } from 'zod'

import { getOpenaiResponse } from '../llm/getOpenaiResponse'

const nullableText = z.string().nullable()

const generatedCardSchema = z.object({
  title: z.string().trim().min(1).max(200),
  context: nullableText,
  need: nullableText,
  target_users: nullableText,
  data: nullableText,
  constraints: nullableText,
  expected_result: nullableText,
  success_criteria: nullableText,
  contact: nullableText,
  interaction_format: nullableText,
})

const DRAFT_INSTRUCTIONS = `Convert the supplied business description and any clarification answers into an editable project card.
Return only valid JSON without markdown with exactly these fields: title, context, need, target_users, data, constraints, expected_result, success_criteria, contact, interaction_format.
Every field except title may be null. Use only facts present in the input. Never guess, embellish, or add facts. Keep missing information null. The title must be a short neutral summary of the supplied need.`

export const generateProjectCardDraft = async (
  input: unknown,
  requesterEmail: string
): Promise<GeneratedProjectCard> => {
  const response = await getOpenaiResponse({
    input: JSON.stringify(input),
    email: requesterEmail,
    instructions: DRAFT_INSTRUCTIONS,
  })
  const firstBrace = response.text.indexOf('{')
  const lastBrace = response.text.lastIndexOf('}')

  if (firstBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('AI project card response did not contain JSON')
  }

  const parsed: unknown = JSON.parse(
    response.text.slice(firstBrace, lastBrace + 1)
  )
  return generatedCardSchema.parse(parsed)
}

export type GeneratedProjectCard = z.infer<typeof generatedCardSchema>
