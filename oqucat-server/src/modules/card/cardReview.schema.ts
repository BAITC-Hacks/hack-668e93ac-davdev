import { z } from 'zod'

const criterionSchema = z
  .object({
    name: z.string().min(1),
    points: z.number().int().min(0),
    max_points: z.number().int().positive(),
    expected: z.string(),
    got: z.string(),
  })
  .refine(({ max_points, points }) => points <= max_points, {
    message: 'points must not exceed max_points',
  })

const criterionMaximums: Record<string, number> = {
  context_and_need: 20,
  data_and_materials: 20,
  expected_result: 15,
  success_criteria: 15,
  constraints: 10,
  target_users: 10,
  business_contact: 10,
}

const ratingSchema = z
  .record(z.string(), criterionSchema)
  .superRefine((rating, context) => {
    for (const [criterion, maximum] of Object.entries(criterionMaximums)) {
      if (!Object.hasOwn(rating, criterion)) {
        context.addIssue({
          code: 'custom',
          message: `Missing rating criterion: ${criterion}`,
          path: [criterion],
        })
      } else if (rating[criterion].max_points !== maximum) {
        context.addIssue({
          code: 'custom',
          message: `Invalid maximum for ${criterion}`,
          path: [criterion, 'max_points'],
        })
      }
    }

    for (const criterion of Object.keys(rating)) {
      if (!(criterion in criterionMaximums)) {
        context.addIssue({
          code: 'custom',
          message: `Unknown rating criterion: ${criterion}`,
          path: [criterion],
        })
      }
    }
  })

export const reviewResponseSchema = z.object({
  rating: ratingSchema,
  reward_points: z.number().int().min(0).max(10_000),
})
