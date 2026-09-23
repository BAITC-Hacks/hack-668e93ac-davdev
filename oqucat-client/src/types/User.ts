import type { Language } from './Languages'
import type { UserRole } from './UserRole'

export interface UserData {
  id: string
  name: string
  role: UserRole
  image: string
  email: string
  locale: Language
  tz: string
  telegramId: string
}
