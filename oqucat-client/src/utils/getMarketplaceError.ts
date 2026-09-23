import { isAxiosError } from 'axios'

import i18n from '@/i18n'

export const getMarketplaceError = (error: unknown) => {
  let code = error instanceof Error ? error.message : ''
  if (isAxiosError<{ message?: unknown }>(error)) {
    const status = error.response?.status
    const message = error.response?.data?.message
    code = typeof message === 'string' ? message : ''
    if (status === 401) {
      code = 'authorization_required'
    }
    if (status === 403 && !code) {
      code = 'forbidden'
    }
    if (status === 429) {
      code = 'too_many_requests'
    }
    if (!error.response) {
      code = 'network_error'
    }
  }
  const key = `user:apiErrors.${code}`
  return i18n.t(i18n.exists(key) ? key : 'user:apiErrors.generic')
}

export const isWebUrl = (value: string) => {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}
