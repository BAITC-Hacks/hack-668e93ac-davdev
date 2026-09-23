import { z } from 'zod'

import { getOpenaiResponse } from '../llm/getOpenaiResponse'
import type { ProjectCardSnapshot } from './ProjectCardReview.model'

const questionsResponseSchema = z.object({
  questions: z.array(z.string().trim().min(1).max(5000)).min(3).max(7),
})

const CLARIFICATION_INSTRUCTIONS = `Analyze the supplied project card snapshot and identify missing or unclear information that prevents a student team from starting work.
Return only valid JSON without markdown in this form: {"questions":["question 1","question 2","question 3"]}.
Ask between 3 and 7 concise, relevant questions. Prioritize context and need, available data, expected result, measurable success criteria, constraints, target users, and communication with the business. Do not invent facts and do not ask for information already present.`

export const generateProjectClarifications = async (
  cardCopy: ProjectCardSnapshot,
  requesterEmail: string
): Promise<string[]> => {
  const response = await getOpenaiResponse({
    input: JSON.stringify(cardCopy),
    email: requesterEmail,
    instructions: CLARIFICATION_INSTRUCTIONS,
  })
  const firstBrace = response.text.indexOf('{')
  const lastBrace = response.text.lastIndexOf('}')

  if (firstBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('AI clarification response did not contain JSON')
  }

  const parsed: unknown = JSON.parse(
    response.text.slice(firstBrace, lastBrace + 1)
  )
  return questionsResponseSchema.parse(parsed).questions
}
