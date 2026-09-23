import { useMemo } from 'react'
import { MdBadge as RoleIcon } from 'react-icons/md'

import WorkspaceLayout from '@/components/WorkspaceLayout'
import type { WorkspaceItem } from '@/types/WorkspaceItem'

import RoleSelection from './RoleSelection'

const AllTabsOnboarding = () => {
  const items = useMemo(
    (): WorkspaceItem[] => [
      {
        id: 'role',
        icon: RoleIcon,
        component: <RoleSelection />,
      },
    ],
    []
  )

  return <WorkspaceLayout items={items} workspace="onboarding" />
}

export default AllTabsOnboarding
