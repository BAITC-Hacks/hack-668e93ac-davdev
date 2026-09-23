import { createHmac } from 'node:crypto'

import cfg from '@/config'

export const getSafetyIdentifier = (email: string): string =>
  createHmac('sha256', cfg.SECRET_KEY)
    .update(email.trim().toLowerCase(), 'utf8')
    .digest('hex')
