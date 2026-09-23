import type { EmailCheckStatus } from '@/types/EmailCheckResult'
import type { PushInstallationInput } from '@/types/PushInstallationInput'
import getLocale from '@/utils/getLocale'
import { getTz } from '@/utils/getTz'

import { apiRequest, host } from '.'

export const checkEmail = (email: string, captchaToken: string) =>
  apiRequest(
    host.post<EmailCheckStatus>(
      'alt-auth/check_email',
      { email },
      { headers: { 'x-captcha-response': captchaToken } }
    ),
    {
      success: false,
      error: false,
    }
  )

export const registerPushInstallation = (data: PushInstallationInput) =>
  apiRequest(host.post('user/register_push', data))

export const requestTelegramCode = (email: string) =>
  apiRequest(host.post('alt-auth/req_tg', { email }))

export const verifyTelegramCode = (code: string) =>
  apiRequest(
    host.post('alt-auth/login_tg', {
      code,
      locale: getLocale(),
      tz: getTz(),
    })
  )
