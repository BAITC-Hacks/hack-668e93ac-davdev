import { useMemo } from 'react'
import { MdNotifications as NotificationsIcon } from 'react-icons/md'

import UserAvatarFallback from '@/components/UserAvatarFallback'
import WorkspaceLayout from '@/components/WorkspaceLayout'
import Chat from '@/pages/common/chat/Chat'
import ChatBadge from '@/pages/common/chat/ChatBadge'
import Profile from '@/pages/common/profile/Profile'
import type { WorkspaceItem } from '@/types/WorkspaceItem'

import NotificationsSuperadmin from './notifications/NotificationsSuperadmin'

const AllTabsSuperAdmin = () => {
  const items = useMemo(
    (): WorkspaceItem[] => [
      {
        id: 'notifications',
        icon: NotificationsIcon,
        component: <NotificationsSuperadmin />,
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

  return <WorkspaceLayout items={items} workspace="superadmin" />
}

export default AllTabsSuperAdmin
