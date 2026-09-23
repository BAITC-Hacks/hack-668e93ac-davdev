import { useMemo } from 'react'
import { MdBadge as RoleIcon } from 'react-icons/md'

import TabRespSelector from '@/components/TabRespSelector'
import type { TabItem } from '@/types/TabItem'

import RoleSelection from './RoleSelection'

const AllTabsOnboarding = () => {
  const tabs = useMemo(
    (): TabItem[] => [
      {
        id: 'role',
        icon: RoleIcon,
        component: <RoleSelection />,
      },
    ],
    []
  )

  return <TabRespSelector tabs={tabs} />
}

export default AllTabsOnboarding
