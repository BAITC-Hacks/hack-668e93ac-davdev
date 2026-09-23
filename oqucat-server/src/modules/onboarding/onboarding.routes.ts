import { Router } from 'express'

import sequelize from '../../db'
import { validateRequest } from '../../middleware/validateRequest'
import { UserRole } from '../../types/UserRole'
import { StudentProfile } from '../student/StudentProfile.model'
import { User } from '../user/User.model'
import { selectRoleSchema } from './onboarding.schemas'

const r = Router()

r.post('/role', validateRequest(selectRoleSchema), async (req, res) => {
  const selectedRole = req.body.role

  const assigned = await sequelize.transaction(async (transaction) => {
    const [updatedCount] = await User.update(
      { role: selectedRole },
      {
        where: {
          id: req.user.id,
          role: UserRole.UNASSIGNED,
        },
        transaction,
      }
    )

    if (updatedCount === 0) {
      return false
    }

    if (selectedRole === UserRole.USER) {
      await StudentProfile.findOrCreate({
        where: { user_id: req.user.id },
        defaults: { user_id: req.user.id },
        transaction,
      })
    }

    return true
  })

  if (!assigned) {
    return res.status(409).json({ message: 'role_already_assigned' })
  }

  return res.json({ role: selectedRole })
})

export { r as onboardingRouter }
