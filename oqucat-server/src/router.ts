import { Router } from 'express'
import slowDownMiddleware from 'express-slow-down'

import cfg from './config'
import accessLevel from './middleware/accessLevel'
import { aiRouter } from './modules/ai/ai.routes'
import { altAuthRouter } from './modules/auth/altauth.routes'
import { chatRouter } from './modules/chat/chat.routes'
import { notificationRouter } from './modules/notification/notification.routes'
import { userRouter } from './modules/user/user.routes'
import { UserRole as R } from './types/UserRole'

const slower = slowDownMiddleware({
  windowMs: 15 * 60 * 1000,
  delayAfter: cfg.DEV ? 100 : 10,
  delayMs: (hits) => hits * 500,
})

const router = Router()

router.use('/alt-auth', slower, altAuthRouter)
router.use('/ai', accessLevel(), aiRouter)
router.use('/user', accessLevel(), userRouter)
router.use('/chat', accessLevel(), chatRouter)
router.use('/notification', accessLevel([R.SUPERADMIN]), notificationRouter)

export default router
