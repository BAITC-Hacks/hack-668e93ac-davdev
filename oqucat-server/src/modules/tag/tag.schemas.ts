import { z } from 'zod'

export const listTagsSchema = {
  query: z.object({
    search: z.string().trim().max(100).optional(),
  }),
}

export const createTagSchema = {
  body: z.object({
    name: z.string().trim().min(1).max(100),
    logo: z.union([z.url(), z.literal(''), z.null()]).optional(),
  }),
}

export const tagParamsSchema = {
  params: z.object({ tagId: z.uuid() }),
}

export const updateTagSchema = {
  body: createTagSchema.body.partial(),
}
