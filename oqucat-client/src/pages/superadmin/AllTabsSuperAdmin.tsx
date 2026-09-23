import { useMemo } from 'react'
import {
  MdCode as CodeIcon,
  MdNotifications as NotificationsIcon,
} from 'react-icons/md'

import { authClient } from '@/auth/betterAuth'
import TabRespSelector from '@/components/TabRespSelector'
import UserAvatarFallback from '@/components/UserAvatarFallback'
import Chat from '@/pages/common/chat/Chat'
import ChatBadge from '@/pages/common/chat/ChatBadge'
import EditorPage from '@/pages/common/editor/Editor'
import Profile from '@/pages/common/profile/Profile'
import type { TabItem } from '@/types/TabItem'

import NotificationsSuperadmin from './notifications/NotificationsSuperadmin'

const AllTabsSuperAdmin = () => {
  const { data, isPending } = authClient.useSession()

  const tabs = useMemo(
    (): TabItem[] => [
      {
        id: 'notifications',
        icon: NotificationsIcon,
        component: <NotificationsSuperadmin />,
      },
      {
        id: 'editor',
        icon: CodeIcon,
        component: <EditorPage />,
      },
      {
        id: 'chat',
        icon: ChatBadge,
        component: <Chat />,
      },
      {
        id: 'myaccount',
        icon: UserAvatarFallback,
        component: <Profile />,
      },
    ],
    []
  )

  if (!data || isPending) {
    return null
  }

  return <TabRespSelector tabs={tabs} />
}

export default AllTabsSuperAdmin
