// oxlint-disable eslint/max-lines -- This module keeps the native bridge lifecycle together.

import { registerPushInstallation } from '@/api/http/auth'
import { notify } from '@/context/notification/notify'
import logger from '@/utils/logger'

interface TauriFcmMessage {
  id: string
  from: string | null
  sentTime: number
  data: Partial<Record<string, string>>
  notification?: {
    title: string | null
    body: string | null
  }
}

interface TauriFcmNotificationOpen {
  id: string
  data: Record<string, string>
}

interface InstallationIdEvent {
  installationId: string
}

interface TauriFcmNative {
  checkNotificationPermission: () => NotificationPermission
  requestNotificationPermission: () => void
  register: () => void
  getInstallationId: () => string | null
  consumeEvents: () => string
}

interface TauriFcmInstallationEvent {
  event: 'fcm-installation-id'
  payload: InstallationIdEvent
}

interface TauriFcmMessageEvent {
  event: 'fcm-message'
  payload: TauriFcmMessage
}

interface TauriFcmNotificationOpenEvent {
  event: 'fcm-notification-opened'
  payload: TauriFcmNotificationOpen
}

type TauriFcmEvent =
  | TauriFcmInstallationEvent
  | TauriFcmMessageEvent
  | TauriFcmNotificationOpenEvent

type FcmEventListener = (event: TauriFcmEvent) => boolean
type InstallationResult = { error: Error } | { value: string }

const listeners = new Set<FcmEventListener>()
const queuedEvents: TauriFcmEvent[] = []
const noOp = () => {
  // The listener has not been registered yet.
}
let initialized = false

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isStringRecord = (
  value: unknown
): value is Partial<Record<string, string>> => {
  if (!isRecord(value)) {
    return false
  }

  return Object.values(value).every((entry) => typeof entry === 'string')
}

const isInstallationIdEvent = (value: unknown): value is InstallationIdEvent =>
  isRecord(value) && typeof value.installationId === 'string'

const isTauriFcmMessage = (value: unknown): value is TauriFcmMessage =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  (typeof value.from === 'string' || value.from === null) &&
  typeof value.sentTime === 'number' &&
  isStringRecord(value.data)

const isTauriFcmNotificationOpen = (
  value: unknown
): value is TauriFcmNotificationOpen =>
  isRecord(value) && typeof value.id === 'string' && isStringRecord(value.data)

const toTauriFcmEvent = (
  event: string,
  payload: unknown
): TauriFcmEvent | undefined => {
  if (event === 'fcm-installation-id' && isInstallationIdEvent(payload)) {
    return { event, payload }
  }

  if (event === 'fcm-message' && isTauriFcmMessage(payload)) {
    return { event, payload }
  }

  if (
    event === 'fcm-notification-opened' &&
    isTauriFcmNotificationOpen(payload)
  ) {
    return { event, payload }
  }

  return undefined
}

const getNativeFcm = (): TauriFcmNative => {
  const fcm = globalThis.FcmNative

  if (!fcm) {
    throw new Error('Native FCM is unavailable')
  }

  return fcm
}

const dispatch = (event: TauriFcmEvent) => {
  const messageId = 'id' in event.payload ? event.payload.id : undefined
  let handled = false

  for (const listener of listeners) {
    handled ||= listener(event)
  }

  if (!handled) {
    queuedEvents.push(event)
  }

  if (event.event === 'fcm-message') {
    const message =
      event.payload.notification?.body ??
      event.payload.data.body ??
      event.payload.notification?.title

    if (message) {
      notify.info(message, undefined, { id: event.payload.id })
    }
  }

  logger.debug('[FCM] JS event', {
    event: event.event,
    handled,
    listenerCount: listeners.size,
    messageId,
  })
}

const parseEvents = (value: string): TauriFcmEvent[] => {
  try {
    const parsed: unknown = JSON.parse(value)

    if (!Array.isArray(parsed)) {
      return []
    }

    const events: TauriFcmEvent[] = []

    for (const entry of parsed) {
      if (!isRecord(entry) || typeof entry.event !== 'string') {
        continue
      }

      const event = toTauriFcmEvent(entry.event, entry.payload)

      if (event) {
        events.push(event)
      }
    }

    return events
  } catch {
    return []
  }
}

const initialize = () => {
  if (initialized) {
    return
  }

  initialized = true

  for (const eventName of [
    'fcm-installation-id',
    'fcm-message',
    'fcm-notification-opened',
  ]) {
    globalThis.addEventListener(eventName, (event) => {
      const payload: unknown =
        event instanceof CustomEvent ? event.detail : undefined
      const fcmEvent = toTauriFcmEvent(eventName, payload)

      if (fcmEvent) {
        logger.info('[FCM] JS native event received', fcmEvent)
        dispatch(fcmEvent)
      } else {
        logger.warn('[FCM] invalid native event payload', { event: eventName })
      }
    })
  }

  const pendingEvents = parseEvents(getNativeFcm().consumeEvents())

  logger.debug('[FCM] JS bridge initialized', {
    pendingEventCount: pendingEvents.length,
  })

  for (const event of pendingEvents) {
    dispatch(event)
  }
}

const subscribe = (listener: FcmEventListener) => {
  initialize()
  listeners.add(listener)

  const events = queuedEvents.splice(0)

  logger.debug('[FCM] JS listener registered', {
    bufferedEventCount: events.length,
    listenerCount: listeners.size,
  })

  for (const event of events) {
    dispatch(event)
  }

  return () => {
    listeners.delete(listener)
  }
}

const waitForInstallationId = (): Promise<string> =>
  // oxlint-disable-next-line promise/avoid-new -- Resolving from a native event requires a promise boundary.
  new Promise((resolve, reject) => {
    let settled = false
    const timeout: { id?: ReturnType<typeof globalThis.setTimeout> } = {}
    let unsubscribe = noOp

    const finish = (result: InstallationResult) => {
      if (settled) {
        return
      }

      settled = true

      if (timeout.id !== undefined) {
        globalThis.clearTimeout(timeout.id)
      }

      unsubscribe()

      if ('error' in result) {
        reject(result.error)
      } else {
        resolve(result.value)
      }
    }

    const nextUnsubscribe = subscribe((event) => {
      if (event.event === 'fcm-installation-id') {
        finish({ value: event.payload.installationId })
        return true
      }

      return false
    })

    unsubscribe = nextUnsubscribe

    // oxlint-disable-next-line typescript/no-unnecessary-condition -- The subscription can dispatch buffered events synchronously.
    if (settled) {
      unsubscribe()
      return
    }

    timeout.id = globalThis.setTimeout(() => {
      finish({
        error: new Error(
          'Timed out while registering the Firebase installation'
        ),
      })
    }, 10_000)
  })

const getInstallationId = () => {
  initialize()

  const fcm = getNativeFcm()
  const installationId = fcm.getInstallationId()

  if (installationId) {
    return installationId
  }

  const registered = waitForInstallationId()
  fcm.register()

  return registered
}

const checkTauriNotificationPermission = (): NotificationPermission =>
  getNativeFcm().checkNotificationPermission()

const requestTauriNotificationPermission =
  (): Promise<NotificationPermission> => {
    const fcm = getNativeFcm()
    const permission = fcm.checkNotificationPermission()

    if (permission === 'granted') {
      return Promise.resolve(permission)
    }

    // oxlint-disable-next-line promise/avoid-new -- Resolving from a native event requires a promise boundary.
    return new Promise((resolve) => {
      const listener = (event: Event) => {
        if (!(event instanceof CustomEvent) || !isRecord(event.detail)) {
          return
        }

        const result = event.detail.permission

        if (
          result !== 'granted' &&
          result !== 'denied' &&
          result !== 'default'
        ) {
          return
        }

        globalThis.removeEventListener('fcm-permission', listener)
        resolve(result)
      }

      globalThis.addEventListener('fcm-permission', listener)
      fcm.requestNotificationPermission()
    })
  }

const registerTauriFcm = async () => {
  if (checkTauriNotificationPermission() !== 'granted') {
    return noOp
  }

  const installationId = await getInstallationId()

  const unsubscribe = subscribe((event) => {
    if (event.event !== 'fcm-installation-id') {
      return false
    }

    void registerPushInstallation({
      installationId: event.payload.installationId,
      platform: 'android',
      identifierType: 'fid',
    })

    return true
  })

  await registerPushInstallation({
    installationId,
    platform: 'android',
    identifierType: 'fid',
  })

  return unsubscribe
}

const subscribeToTauriMessages = (
  handler: (message: TauriFcmMessage) => void
) =>
  subscribe((event) => {
    if (event.event === 'fcm-message') {
      handler(event.payload)
      return true
    }

    return false
  })

const subscribeToTauriNotificationOpens = (
  handler: (notification: TauriFcmNotificationOpen) => void
) =>
  subscribe((event) => {
    if (event.event === 'fcm-notification-opened') {
      handler(event.payload)
      return true
    }

    return false
  })

declare global {
  var FcmNative: TauriFcmNative | undefined
}

export {
  checkTauriNotificationPermission,
  registerTauriFcm,
  requestTauriNotificationPermission,
  subscribeToTauriMessages,
  subscribeToTauriNotificationOpens,
}
export type { TauriFcmMessage, TauriFcmNotificationOpen }
