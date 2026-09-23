import { Turnstile } from '@marsidev/react-turnstile'
import type { Dispatch, SetStateAction } from 'react'

import { cloudflareSiteKey } from '@/config'

interface ICaptcha {
  captchaToken: string
  setCaptchaToken: Dispatch<SetStateAction<string>>
  onSuccess?: (token: string) => void
}

const Captcha = ({ captchaToken, setCaptchaToken, onSuccess }: ICaptcha) => {
  if (captchaToken || !cloudflareSiteKey) {
    return null
  }

  return (
    <Turnstile
      siteKey={cloudflareSiteKey}
      onSuccess={(token) => {
        setCaptchaToken(token)
        onSuccess?.(token)
      }}
      onExpire={() => setCaptchaToken('')}
      onError={() => setCaptchaToken('')}
    />
  )
}

export default Captcha
