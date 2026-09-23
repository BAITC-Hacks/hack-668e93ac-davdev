import { fromNodeHeaders } from 'better-auth/node'
import { Router } from 'express'

import { validateRequest } from '../../middleware/validateRequest'
import { isPasswordPwned } from '../../utils/isPasswordPwned'
import { saveAvatar } from '../../utils/saveAvatar'
import { Account } from '../auth/Account.model'
import { auth } from '../auth/betterAuth'
import { PushInstallation } from './PushInstallation.model'
import { registerPushSchema, setPasswordSchema } from './user.schemas'

const r = Router()

r.post(
  '/set_password',
  validateRequest(setPasswordSchema),
  async (req, res) => {
    if (await isPasswordPwned(req.body.newPassword)) {
      return res.status(400).json({
        message: 'password_compromised',
      })
    }

    const credentialAccount = await Account.findOne({
      where: {
        userId: req.user.id,
        providerId: 'credential',
      },
      attributes: ['password'],
    })

    if (credentialAccount?.password) {
      return res.status(400).json({
        message: 'password_already_set',
      })
    }

    const result = await auth.api.setPassword({
      body: req.body,
      headers: fromNodeHeaders(req.headers),
    })

    return res.json(result)
  }
)

r.post(
  '/register_push',
  validateRequest(registerPushSchema),
  async (req, res) => {
    const { identifierType, installationId, platform } = req.body

    await PushInstallation.upsert({
      user_id: req.user.id,
      token: installationId,
      platform,
      user_agent: req.headers['user-agent'],
      identifierType,
    })

    return res.sendStatus(204)
  }
)

r.patch('/avatar', async (req, res) => {
  if (!req.files?.avatar) {
    return res.status(400).json({
      message: 'noavatar',
    })
  }

  const file = req.files.avatar

  if (Array.isArray(file)) {
    return res.status(400).json({
      message: 'multipleavatars',
    })
  }

  const { user } = req
  const fileName = await saveAvatar(user, file.data)

  return res.json({
    newImage: fileName,
  })
})

export { r as userRouter }
