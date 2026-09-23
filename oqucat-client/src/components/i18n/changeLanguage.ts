import type { i18n } from 'i18next'

import { authClient, type BetterAuthUser } from '@/auth/betterAuth'

export const changeLanguage = (
  user: BetterAuthUser | undefined,
  i18n: i18n,
  lang: string
) => {
  console.log(user)
  void i18n.changeLanguage(lang)
  if (user) {
    void authClient.updateUser({ locale: lang })
  }
}
