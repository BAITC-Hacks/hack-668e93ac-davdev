import axios, { isAxiosError, type AxiosResponse } from 'axios'

import { baseURL } from '@/config'
import { notify } from '@/context/notification/notify'
import i18n from '@/i18n'
import logger from '@/utils/logger'

interface ApiErrorResponse {
  message?: string
}

const apiErrorMessageKeys: Record<string, string> = {
  accnf: 'common:api.errors.accountNotFound',
  assignerr: 'common:api.errors.linkCreationFailed',
  authorization_required: 'common:api.errors.authorizationRequired',
  badcode: 'common:api.errors.invalidCode',
  badoldpass: 'common:api.errors.incorrectCurrentPassword',
  emailconf: 'common:api.errors.emailAlreadyRegistered',
  forbidden: 'common:api.errors.forbidden',
  invtkn: 'common:api.errors.invalidToken',
  invalidfile: 'common:api.errors.invalidFile',
  multipleavatars: 'common:api.errors.multipleAvatarFiles',
  noavatar: 'common:api.errors.avatarMissing',
  tmr: 'common:api.errors.tooManyRequests',
  'Internal server error': 'common:api.errors.internalServer',
}

const translateApiError = (code: string) =>
  i18n.t(apiErrorMessageKeys[code] ?? code)

const apiError = (e: unknown) => {
  if (isAxiosError<ApiErrorResponse>(e)) {
    if (e.status === 429) {
      notify.error(i18n.t('common:api.errors.tooManyRequests'))
      return
    }

    const message = e.response?.data.message

    if (message) {
      notify.error(translateApiError(message))
    }
  } else if (typeof e === 'string') {
    notify.error(translateApiError(e))
  } else {
    logger.error(e)
  }
}

const apiSuccess = (key: string) => notify.success('Успех!', i18n.t(key))

export interface ApiRequestOptions {
  success?: false | string
  error?: boolean | string
}

export interface ApiSuccessResponse {
  success: boolean
}

export const apiRequest = async <T>(
  req: Promise<AxiosResponse<T>>,
  options: ApiRequestOptions = {}
): Promise<T | undefined> => {
  try {
    const { data } = await req

    if (typeof options.success === 'string') {
      apiSuccess(options.success)
    }

    return data
  } catch (error) {
    if (options.error !== false) {
      apiError(typeof options.error === 'string' ? options.error : error)
    }

    return undefined
    // throw error
  }
}

export const host = axios.create({ baseURL, withCredentials: true })
