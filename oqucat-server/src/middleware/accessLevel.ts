import { fromNodeHeaders } from 'better-auth/node'
import type { NextFunction, Request, RequestHandler, Response } from 'express'

import { logger } from '../logger'
import { auth } from '../modules/auth/betterAuth'
import { User } from '../modules/user/User.model'
import type { UserRole } from '../types/UserRole'

export default function accessLevel(roles?: UserRole[]): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'OPTIONS') {
      next()
      return
    }

    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      })

      if (!session) {
        return res.status(401).json({
          message: 'authorization_required',
        })
      }

      const user = await User.findByPk(session.user.id)

      if (!user) {
        return res.status(401).json({
          message: 'authorization_required',
        })
      }

      if (roles && !roles.includes(user.role)) {
        return res.status(403).json({
          message: 'forbidden',
        })
      }

      req.user = user
      req.session = session

      return next()
    } catch (error) {
      logger.error({ error }, 'Authorization error')

      return res.status(401).json({
        message: 'authorization_required',
      })
    }
  }
}
