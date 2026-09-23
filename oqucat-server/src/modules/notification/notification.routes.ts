import { Router } from 'express'

import { validateRequest } from '../../middleware/validateRequest'
import { PushInstallation } from '../user/PushInstallation.model'
import { User } from '../user/User.model'
import { sendWebPush } from './firebase/sendWebPush'
import { pushNotificationSchema } from './notification.schemas'

const r = Router()

r.post('/push', validateRequest(pushNotificationSchema), async (req, res) => {
  const { user_id, title, body } = req.body
  const user = await User.findByPk(user_id, { include: PushInstallation })
  if (!user) {
    return res.status(404)
  }
  await sendWebPush(user, { title, body })
  return res.json({ success: true })
})

r.get('/users', async (req, res) => {
  const users = await User.findAll({
    attributes: ['id', 'name'],
    include: [
      {
        model: PushInstallation,
        required: true,
        attributes: ['token'],
      },
    ],
  })
  return res.json(users)
})

export { r as notificationRouter }
