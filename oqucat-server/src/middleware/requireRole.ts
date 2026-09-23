import type { NextFunction, Request, RequestHandler, Response } from 'express'

import type { UserRole } from '../types/UserRole'

export default function requireRole(
  roles: UserRole[]
): RequestHandler<Record<string, string>, unknown, unknown, unknown> {
  return (
    req: Request<Record<string, string>, unknown, unknown, unknown>,
    res: Response<unknown>,
    next: NextFunction
  ) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'forbidden' })
    }

    return next()
  }
}
