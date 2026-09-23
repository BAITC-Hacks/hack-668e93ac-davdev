import { z } from 'zod'

import { UserRole } from '../../types/UserRole'

export const selectRoleSchema = {
  body: z.object({
    role: z.enum([UserRole.USER, UserRole.BUSINESS]),
  }),
}
