import { z } from 'zod'

import { zodUserID } from '../../types/UserId'

export const createReviewSchema = {
  params: z.object({ applicationId: z.uuid() }),
  body: z.object({
    student_id: zodUserID,
    rating: z.number().int().min(1).max(5),
    comment: z.string().trim().max(5000).nullish(),
  }),
}

export const studentReviewsSchema = {
  params: z.object({ studentId: zodUserID }),
}

export const teamReviewsSchema = {
  params: z.object({ teamId: z.uuid() }),
}

export const applicationReviewsSchema = {
  params: z.object({ applicationId: z.uuid() }),
}
