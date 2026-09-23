import type { RecentAccountStore } from '@/types/RecentAccounts'

import { isRecentAccount } from './isRecentAccount'
import { isRecord } from './isRecord'

export const isRecentAccountStore = (
  value: unknown
): value is RecentAccountStore =>
  isRecord(value) &&
  Object.values(value).every((account) => isRecentAccount(account))
