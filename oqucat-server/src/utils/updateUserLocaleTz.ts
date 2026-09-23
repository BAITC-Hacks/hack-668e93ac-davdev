import type { User } from '@/modules/user/User.model'
import type { Language } from '@/types/Languages'

export const updateUserLocaleTz = (u: User, locale?: Language, tz?: string) => {
  if (locale) {
    u.locale = locale
  }
  if (tz) {
    u.tz = tz
  }
  return u.save()
}
