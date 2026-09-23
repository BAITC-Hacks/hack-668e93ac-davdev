import type { RecentAccountStore } from '@/types/RecentAccounts'

import { isRecentAccountStore } from './isRecentAccountStore'

export const getRecentAccounts = (): RecentAccountStore => {
  const value = localStorage.getItem('recent_accs')

  if (!value) {
    return {}
  }

  try {
    const parsed: unknown = JSON.parse(value)
    return isRecentAccountStore(parsed) ? parsed : {}
  } catch {
    return {}
  }
}
