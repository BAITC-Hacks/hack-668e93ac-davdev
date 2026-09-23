import { useMemo } from 'react'
import { MdCode as CodeIcon } from 'react-icons/md'

import TabRespSelector from '@/components/TabRespSelector'
import UserAvatarFallback from '@/components/UserAvatarFallback'
import Chat from '@/pages/common/chat/Chat'
import ChatBadge from '@/pages/common/chat/ChatBadge'
import EditorPage from '@/pages/common/editor/Editor'
import Profile from '@/pages/common/profile/Profile'
import type { TabItem } from '@/types/TabItem'

const AllTabsUser = () => {
  const tabs: TabItem[] = useMemo(
    () => [
      {
        id: 'chat',
        icon: ChatBadge,
        component: <Chat />,
      },
      {
        id: 'editor',
        icon: CodeIcon,
        component: <EditorPage />,
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

export default AllTabsUser
