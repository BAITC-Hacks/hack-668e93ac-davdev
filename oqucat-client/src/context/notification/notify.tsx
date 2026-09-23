import {
  pushNotification,
  type NotifyOptions,
} from '@/context/notification/notificationStore'
import type { NotifySeverity } from '@/types/NotifySeverity'

const createNotifier =
  (severity: NotifySeverity) =>
  (title: string | undefined, message?: string, options?: NotifyOptions) =>
    pushNotification(severity, title ?? '', message, options)

export const notify = {
  success: createNotifier('success'),
  error: createNotifier('error'),
  warn: createNotifier('warning'),
  info: createNotifier('info'),
  msg: createNotifier('msg'),
}
