import { notify } from '@/context/notification/notify'
import type { Message } from '@/types/Chat'
import { getAvatar } from '@/utils/getAvatar'

export const requestNotificationPermission = async () => {
  if (!('Notification' in globalThis)) {
    notify.warn('This browser does not support notifications.')
    return
  }

  await Notification.requestPermission()
}

export const notifyMessage = (message: Message, tab: string, title: string) => {
  if (Notification.permission !== 'granted') {
    return
  }

  const notification = new Notification(title, {
    body: message.content,
    icon: getAvatar(message.from?.image),
  })

  notification.addEventListener('click', () => {
    notification.close()
    globalThis.focus()

    const searchParams = new URLSearchParams(globalThis.location.search)
    searchParams.set('tab', tab)
    searchParams.set('chat', message.from_id)
    globalThis.location.search = searchParams.toString()
  })
}
