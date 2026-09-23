import { z } from 'zod'

import { zodUserID } from '../../types/UserId'

export const updateStudentProfileSchema = {
  body: z.object({
    portfolio: z.string().trim().max(10_000).nullish(),
    social_links: z.record(z.string().min(1).max(50), z.url()).optional(),
    website: z.union([z.url(), z.literal(''), z.null()]).optional(),
    page_theme: z.record(z.string(), z.unknown()).nullish(),
  }),
}

export const updateStudentTagsSchema = {
  body: z.object({
    tag_ids: z.array(z.uuid()).max(50),
  }),
}

export const studentParamsSchema = {
  params: z.object({ userId: zodUserID }),
}
