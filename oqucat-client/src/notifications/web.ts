import {
  onMessage,
  onRegistered,
  onUnregistered,
  register,
} from 'firebase/messaging'

import { registerPushInstallation } from '@/api/http/auth'
import { appName, vapidKey } from '@/config'
import { messagingPromise } from '@/firebase'

export const registerWebFcm = async () => {
  if (!('serviceWorker' in globalThis.navigator)) {
    return () => {
      // No listeners were registered.
    }
  }

  if (!('Notification' in globalThis)) {
    return () => {
      // No listeners were registered.
    }
  }

  const messaging = await messagingPromise

  if (!messaging) {
    return () => {
      // Messaging is unavailable.
    }
  }

  const sw = await globalThis.navigator.serviceWorker.register(
    `/firebase-messaging-sw.js?appName=${encodeURIComponent(appName)}`,
    {
      scope: '/firebase-cloud-messaging-push-scope',
    }
  )

  const unsubscribeRegistered = onRegistered(messaging, (fid) => {
    void registerPushInstallation({
      installationId: fid,
      platform: 'web',
      identifierType: 'fid',
    })
  })

  const unsubscribeUnregistered = onUnregistered(messaging, () => {
    // The backend installation remains valid until the next registration.
  })

  await register(messaging, {
    vapidKey,
    serviceWorkerRegistration: sw,
  })

  return () => {
    unsubscribeRegistered()
    unsubscribeUnregistered()
  }
}

export const subscribeToWebMessages = async (
  handler: Parameters<typeof onMessage>[1]
): Promise<ReturnType<typeof onMessage> | (() => void)> => {
  const messaging = await messagingPromise

  if (!messaging) {
    return () => {
      // Messaging is unavailable.
    }
  }

  return onMessage(messaging, handler)
}
