import type { UserId } from './UserId'

export interface UserForNotif {
  id: UserId
  name: string
  push_installations: { token: string }[]
}
