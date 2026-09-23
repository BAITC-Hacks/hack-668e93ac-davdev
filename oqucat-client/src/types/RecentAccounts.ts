export interface RecentAccount {
  id: string
  image: string | null | undefined
  last_used: number
  name: string
}

export type RecentAccountStore = Record<string, RecentAccount>
