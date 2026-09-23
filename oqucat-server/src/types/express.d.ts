import type { User } from '../modules/user/User.model'
import type { AuthSession } from '../types/Auth'

declare global {
  namespace Express {
    interface Request {
      user: User
      session: AuthSession
      rateLimitUserId?: string
    }
  }
}
