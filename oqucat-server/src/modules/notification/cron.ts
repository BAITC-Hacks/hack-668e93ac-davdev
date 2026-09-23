import cron from 'node-cron'

import { logger } from '@/logger'

export const startCronJobs = () => {
  cron.schedule('* * 13 * 5', () => {
    logger.debug('friday the 13th')
  })
}
