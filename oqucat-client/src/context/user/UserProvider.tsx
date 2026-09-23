import { type ReactNode, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getUnreadCount } from '@/api/http/chat'
import { useSocket } from '@/api/sio/ws'
import { useAuthSession } from '@/auth/betterAuth'
import { notify } from '@/context/notification/notify'
import { subscribeToWebMessages } from '@/notifications/web'
import { playConversationSound } from '@/pages/common/chat/conversationSound'
import type { Message } from '@/types/Chat'
import { isLanguage } from '@/types/Languages'
import { isTauri } from '@/utils/isTauri'
import { notifyMessage } from '@/utils/notifications'

import { UserContext } from './UserContext'

interface UserProviderProps {
  children: ReactNode
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const { data } = useAuthSession()
  const user = data?.user

  const [unreadCount, setUnreadCount] = useState(0)
  const { i18n, t } = useTranslation()

  useEffect(() => {
    const locale = user?.locale

    if (locale && isLanguage(locale) && i18n.resolvedLanguage !== locale) {
      void i18n.changeLanguage(locale)
    }
  }, [i18n, user?.locale])

  useEffect(() => {
    const userId = user?.id
    if (!userId) {
      return
    }

    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadCount()
        if (count !== undefined) {
          setUnreadCount(count)
        }
      } catch {
        // The API client handles request errors.
      }
    }

    void fetchUnreadCount()
  }, [user?.id])

  const sio = useSocket(user)

  useEffect(() => {
    let cleanup: (() => void) | undefined

    if (sio && user) {
      let activeChatId: string | null = null
      const handleActiveChat = (event: Event) => {
        if ('detail' in event && typeof event.detail === 'string') {
          activeChatId = event.detail
        } else {
          activeChatId = null
        }
      }
      const handleMessage = (message: Message) => {
        if (message.to_id !== user.id || message.from_id === user.id) {
          return
        }

        const isWindowFocused = document.visibilityState === 'visible'
        const chatId = new URLSearchParams(globalThis.location.search).get(
          'chat'
        )
        const focusedChatId = activeChatId ?? chatId
        const isChatFocused =
          focusedChatId !== null && message.from_id === focusedChatId

        playConversationSound('received')

        if (!isChatFocused) {
          setUnreadCount((count) => count + 1)
        }

        if (!isWindowFocused) {
          notifyMessage(
            message,
            'chat',
            t('common:notifications.newMessage', {
              name: message.from?.name,
            })
          )
        }
      }

      sio.on('chat-message', handleMessage)
      globalThis.addEventListener('oqucat:active-chat', handleActiveChat)

      cleanup = () => {
        sio.off('chat-message', handleMessage)
        globalThis.removeEventListener('oqucat:active-chat', handleActiveChat)
      }
    }

    return cleanup
  }, [sio, t, user])

  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    if (!isTauri) {
      const subscribe = async () => {
        try {
          unsubscribe = await subscribeToWebMessages((payload) => {
            const body = payload.notification?.body
            if (body) {
              notify.info(body)
            }
          })
        } catch {
          // Web push subscription is optional.
        }
      }

      void subscribe()
    }

    return () => {
      unsubscribe?.()
    }
  }, [])
  return (
    <UserContext
      value={{
        sio,
        unreadCount: user ? unreadCount : 0,
        setUnreadCount,
      }}
    >
      {children}
    </UserContext>
  )
}
