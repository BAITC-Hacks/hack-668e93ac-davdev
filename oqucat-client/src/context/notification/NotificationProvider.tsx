import { useEffect, useState, type ReactNode } from 'react'

import ToastContent from '@/context/notification/ToastContent'

import {
  removeNotification,
  subscribeToNotifications,
  type NotificationItem,
} from './notificationStore'

interface NotificationProviderProps {
  children: ReactNode
}

const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [items, setItems] = useState<NotificationItem[]>([])

  useEffect(() => subscribeToNotifications(setItems), [])

  return (
    <>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-[999999999] flex max-h-[calc(100vh-2rem)] w-[min(356px,calc(100vw-32px))] flex-col items-stretch gap-2 overflow-y-auto overscroll-contain p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[600px]:right-3 max-[600px]:bottom-3 max-[600px]:max-h-[calc(100vh-1.5rem)]">
        {items.map((item) => (
          <div className="pointer-events-auto w-full shrink-0" key={item.id}>
            <ToastContent
              title={item.title}
              message={item.message}
              severity={item.severity}
              onClose={() => {
                removeNotification(item.id)
                item.onClose?.()
              }}
              onAction={() => item.onAction?.()}
              actionLabel={item.actionLabel}
              icon={item.icon}
            />
          </div>
        ))}
      </div>
    </>
  )
}

export default NotificationProvider
