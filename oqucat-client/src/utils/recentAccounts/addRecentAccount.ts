import type { BetterAuthUser } from '@/auth/betterAuth'
import { getRecentAccounts } from '@/utils/recentAccounts/getRecentAccounts'

export const addRecentAccount = (user: BetterAuthUser) => {
  const recentAccounts = getRecentAccounts()
  recentAccounts[user.email] = {
    id: user.id,
    image: user.image,
    last_used: Date.now(),
    name: user.name,
  }
  localStorage.setItem('recent_accs', JSON.stringify(recentAccounts))
}
