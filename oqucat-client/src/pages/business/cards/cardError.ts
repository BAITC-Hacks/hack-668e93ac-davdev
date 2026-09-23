import { isAxiosError } from 'axios'

import i18n from '@/i18n'
import { getMarketplaceError } from '@/utils/getMarketplaceError'

export const cardError = (error: unknown) => {
  const code = isAxiosError<{ message?: string }>(error)
    ? error.response?.data?.message
    : error instanceof Error
      ? error.message
      : ''
  const key = `business:errors.${code}`
  return i18n.exists(key) ? i18n.t(key) : getMarketplaceError(error)
}
