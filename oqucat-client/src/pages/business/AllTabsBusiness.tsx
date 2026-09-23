import { useMemo } from 'react'

import TabRespSelector from '@/components/TabRespSelector'
import UserAvatarFallback from '@/components/UserAvatarFallback'
import Chat from '@/pages/common/chat/Chat'
import ChatBadge from '@/pages/common/chat/ChatBadge'
import Profile from '@/pages/common/profile/Profile'
import type { TabItem } from '@/types/TabItem'

const AllTabsBusiness = () => {
  const tabs = useMemo(
    (): TabItem[] => [
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

  return <TabRespSelector tabs={tabs} />
}

export default AllTabsBusiness
