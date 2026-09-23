import { useMemo } from 'react'
import {
  MdCode as CodeIcon,
  MdGridView,
  MdGroups,
  MdSend,
  MdEmojiEvents,
} from 'react-icons/md'

import UserAvatarFallback from '@/components/UserAvatarFallback'
import WorkspaceLayout from '@/components/WorkspaceLayout'
import Chat from '@/pages/common/chat/Chat'
import ChatBadge from '@/pages/common/chat/ChatBadge'
import EditorPage from '@/pages/common/editor/Editor'
import Profile from '@/pages/common/profile/Profile'
import type { WorkspaceItem } from '@/types/WorkspaceItem'

import Rankings from './rankings/Rankings'
import Responses from './responses/Responses'
import Tasks from './tasks/Tasks'
import Team from './team/Team'

const AllTabsUser = () => {
  const items: WorkspaceItem[] = useMemo(
    () => [
      { id: 'tasks', icon: MdGridView, component: <Tasks /> },
      { id: 'team', icon: MdGroups, component: <Team /> },
      { id: 'responses', icon: MdSend, component: <Responses /> },
      { id: 'rankings', icon: MdEmojiEvents, component: <Rankings /> },
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

  return <WorkspaceLayout items={items} workspace="student" />
}

export default AllTabsUser
