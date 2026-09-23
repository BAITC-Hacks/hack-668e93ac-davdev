import { notify } from '@/context/notification/notify'
import i18n from '@/i18n'

export const authError = (error: {
  code?: string | undefined
  message?: string | undefined
  status: number
  statusText: string
}) => {
  if (error.code) {
    const errorTranslationKey = `common:auth.errors.${error.code}`

    notify.error(
      i18n.exists(errorTranslationKey)
        ? i18n.t(errorTranslationKey)
        : error.message
    )
  } else {
    notify.error(error.message)
  }
}
