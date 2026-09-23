import { z } from 'zod'

const optionalUrl = z.union([z.url(), z.literal(''), z.null()]).optional()

export const createCompanySchema = {
  body: z.object({
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().max(5000).nullish(),
    logo: optionalUrl,
    website: optionalUrl,
  }),
}

export const updateCompanySchema = {
  body: createCompanySchema.body.partial(),
}

export const companyParamsSchema = {
  params: z.object({ companyId: z.uuid() }),
}
