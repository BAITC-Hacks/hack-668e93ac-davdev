import type { ReactNode } from 'react'

import type { NotifySeverity } from '@/types/NotifySeverity'

interface NotifyOptions {
  onClose?: () => void
  actionLabel?: string
  onAction?: () => void
  icon?: ReactNode
  id?: string
}

interface NotificationItem extends NotifyOptions {
  id: string
  title: string
  message?: string
  severity: NotifySeverity
}

type NotificationListener = (items: NotificationItem[]) => void

let nextId = 0
let items: NotificationItem[] = []
const listeners = new Set<NotificationListener>()

const emit = () => {
  for (const listener of listeners) {
    listener(items)
  }
}

export const subscribeToNotifications = (listener: NotificationListener) => {
  listeners.add(listener)
  listener(items)
  return () => {
    listeners.delete(listener)
  }
}

export const pushNotification = (
  severity: NotifySeverity,
  title: string,
  message?: string,
  options?: NotifyOptions
) => {
  const id = options?.id ?? `notification-${nextId}`
  nextId += 1
  items = [
    ...items.filter((item) => item.id !== id),
    { ...options, id, title, message, severity },
  ]
  emit()
  return id
}

export const removeNotification = (id: string) => {
  items = items.filter((item) => item.id !== id)
  emit()
}

export type { NotificationItem, NotifyOptions }
