import { useMemo } from 'react'

import UserAvatarFallback from '@/components/UserAvatarFallback'
import WorkspaceLayout from '@/components/WorkspaceLayout'
import Chat from '@/pages/common/chat/Chat'
import ChatBadge from '@/pages/common/chat/ChatBadge'
import Profile from '@/pages/common/profile/Profile'
import type { WorkspaceItem } from '@/types/WorkspaceItem'

const AllTabsBusiness = () => {
  const items = useMemo(
    (): WorkspaceItem[] => [
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

  return <WorkspaceLayout items={items} workspace="business" />
}

export default AllTabsBusiness
