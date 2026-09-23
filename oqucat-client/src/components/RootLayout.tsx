import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Outlet } from 'react-router-dom'

import NotificationProvider from '@/context/notification/NotificationProvider'
import { UserProvider } from '@/context/user/UserProvider'
import { useThemeColors } from '@/utils/useThemeColors'

import AppInstallPrompt from './AppInstallPrompt'
import NotificationsPrompt from './NotificationsPrompt'
import ClickSpark from './react-bits/ClickSpark'

const queryClient = new QueryClient()

const RootLayout = () => {
  const colors = useThemeColors()

  return (
    <ClickSpark
      sparkColor={colors.primary}
      sparkSize={10}
      sparkRadius={30}
      sparkCount={8}
      duration={400}
    >
      <NotificationProvider>
        <QueryClientProvider client={queryClient}>
          <UserProvider>
            <NotificationsPrompt />
            <AppInstallPrompt />
            <Outlet />
          </UserProvider>
        </QueryClientProvider>
      </NotificationProvider>
    </ClickSpark>
  )
}

export default RootLayout
