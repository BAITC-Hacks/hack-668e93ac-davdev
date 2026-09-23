import { Router } from 'express'

import { validateRequest } from '../../middleware/validateRequest'
import { User } from '../user/User.model'
import { Account } from './Account.model'
import { checkEmailSchema } from './auth.schemas'
import { Passkey } from './Passkey.model'

const r = Router()

r.post('/check_email', validateRequest(checkEmailSchema), async (req, res) => {
  const { email } = req.body

  const user = await User.findOne({ where: { email } })

  if (!user) {
    return res.json([])
  }

  const [accounts, passkeyCount] = await Promise.all([
    Account.findAll({
      where: {
        userId: user.id,
      },
      attributes: ['providerId'],
    }),
    Passkey.count({ where: { userId: user.id } }),
  ])

  const providers = accounts.map(({ providerId }) => providerId)

  if (passkeyCount > 0) {
    providers.push('passkey')
  }

  return res.json(providers)
})
export { r as altAuthRouter }
