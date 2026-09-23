import cfg from '../config'
import { auth } from '../modules/auth/betterAuth'
import { User } from '../modules/user/User.model'
import { UserRole } from '../types/UserRole'

const seedRootAdmin = async () => {
  const existing = await User.findOne({
    where: { email: cfg.ROOT_EMAIL },
  })

  if (existing) {
    return existing
  }

  const result = await auth.api.createUser({
    body: {
      email: cfg.ROOT_EMAIL,
      password: cfg.ROOT_PASSWORD,
      name: 'Root Admin',
      role: UserRole.SUPERADMIN,
    },
  })

  const user = await User.findByPk(result.user.id)
  if (!user) {
    throw new Error('Failed to create root admin')
  }

  user.emailVerified = true

  await user.save()

  return user
}

export default seedRootAdmin
