import { z } from 'zod'

export const pushNotificationSchema = {
  body: z.object({
    user_id: z.uuidv7(),
    title: z.string(),
    body: z.string(),
  }),
}
