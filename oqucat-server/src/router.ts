import { Router } from 'express'
import slowDownMiddleware from 'express-slow-down'

import cfg from './config'
import accessLevel from './middleware/accessLevel'
import { aiRouter } from './modules/ai/ai.routes'
import { applicationRouter } from './modules/application/application.routes'
import { altAuthRouter } from './modules/auth/altauth.routes'
import { cardRouter } from './modules/card/card.routes'
import { chatRouter } from './modules/chat/chat.routes'
import { companyRouter } from './modules/company/company.routes'
import { notificationRouter } from './modules/notification/notification.routes'
import { leaderboardRouter } from './modules/points/leaderboard.routes'
import { pointsRouter } from './modules/points/points.routes'
import { reviewRouter } from './modules/review/review.routes'
import { studentRouter } from './modules/student/student.routes'
import { tagRouter } from './modules/tag/tag.routes'
import { teamRouter } from './modules/team/team.routes'
import { userRouter } from './modules/user/user.routes'
import { UserRole as R } from './types/UserRole'

const slower = slowDownMiddleware({
  windowMs: 15 * 60 * 1000,
  delayAfter: cfg.DEV ? 100 : 10,
  delayMs: (hits) => hits * 500,
})

const router = Router()
const accountRoles = [R.USER, R.BUSINESS, R.SUPERADMIN]
const marketplaceRoles = [R.USER, R.BUSINESS]

router.use('/alt-auth', slower, altAuthRouter)
router.use('/ai', accessLevel(marketplaceRoles), aiRouter)
router.use('/user', accessLevel(accountRoles), userRouter)
router.use('/chat', accessLevel(accountRoles), chatRouter)
router.use('/companies', accessLevel(marketplaceRoles), companyRouter)
router.use('/students', accessLevel(marketplaceRoles), studentRouter)
router.use('/tags', accessLevel(accountRoles), tagRouter)
router.use('/teams', accessLevel(marketplaceRoles), teamRouter)
router.use('/cards', accessLevel(marketplaceRoles), cardRouter)
router.use('/applications', accessLevel(marketplaceRoles), applicationRouter)
router.use('/reviews', accessLevel(marketplaceRoles), reviewRouter)
router.use('/points', accessLevel(marketplaceRoles), pointsRouter)
router.use('/leaderboards', accessLevel(marketplaceRoles), leaderboardRouter)
router.use('/notification', accessLevel([R.SUPERADMIN]), notificationRouter)

export default router
