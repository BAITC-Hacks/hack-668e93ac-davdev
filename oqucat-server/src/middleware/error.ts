import type { Response } from 'express'

import { logger } from '@/logger'

export const errorMiddleware = (err: unknown, res: Response) => {
  logger.error(err)

  return res.status(500).json({
    message: 'Internal server error',
  })
}
