import { FirebaseError } from 'firebase-admin/app'
import type { Message } from 'firebase-admin/messaging'

import { logger } from '@/logger'

import type { User } from '../../user/User.model'
import { firebaseMessaging } from './messaging'

export const sendWebPush = async (
  user: User,
  options: {
    title: string
    body: string
    icon?: string
    data?: Record<string, string>
    urgent?: boolean
  }
) => {
  const {
    title,
    body,
    icon = '/icon-badge.png',
    data,
    urgent = false,
  } = options
  logger.debug(`[FCM] start for user ${user.id}`)

  const installations = user.push_installations

  if (!installations.length) {
    return
  }

  await Promise.all(
    installations.map(async (installation) => {
      try {
        const message: Message = {
          ...(installation.identifierType === 'fid'
            ? { fid: installation.token }
            : { token: installation.token }),
          notification: {
            title,
            body,
          },

          data,

          webpush: {
            notification: {
              icon,
              badge: '/icon-badge.png',
            },
          },
          android: {
            priority: urgent ? 'high' : 'normal',
          },
          apns: {
            headers: {
              'apns-priority': urgent ? '10' : '5',
            },
          },
        }

        await firebaseMessaging.send(message)

        logger.debug(`[FCM] Sent to installation ${installation.id}`)
      } catch (error) {
        const errorCode = error instanceof FirebaseError ? error.code : null
        const errorMessage = error instanceof Error ? error.message : error

        logger.error(
          { code: errorCode, error: errorMessage },
          `[FCM] Failed installation ${installation.id}`
        )

        const invalidToken =
          errorCode === 'messaging/installation-id-not-registered' ||
          errorCode === 'messaging/invalid-installation-id'

        if (invalidToken) {
          try {
            await installation.destroy()

            logger.debug(
              `[FCM] Removed invalid installation ${installation.id}`
            )
          } catch (deleteError) {
            logger.error(
              { error: deleteError },
              `[FCM] Failed removing installation ${installation.id}`
            )
          }
        }
      }
    })
  )

  logger.debug(`[FCM] Finished sending to ${user.name}`)
}
