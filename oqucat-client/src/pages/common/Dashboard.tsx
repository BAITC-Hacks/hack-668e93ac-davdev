import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { lazy, type JSX, type LazyExoticComponent } from 'react'
import { useTranslation } from 'react-i18next'

import { useAuthSession } from '@/auth/betterAuth.ts'
import { UserRole as R } from '@/types/UserRole.ts'

const gates: Record<R, LazyExoticComponent<() => JSX.Element | null>> = {
  [R.UNASSIGNED]: lazy(() => import('@/pages/onboarding/AllTabsOnboarding')),
  [R.USER]: lazy(() => import('@/pages/user/AllTabsUser')),
  [R.BUSINESS]: lazy(() => import('@/pages/business/AllTabsBusiness')),
  [R.SUPERADMIN]: lazy(
    () => import('@/pages/superadmin/AllTabsSuperAdmin.tsx')
  ),
}

const namespaces: Record<R, string> = {
  [R.UNASSIGNED]: 'common',
  [R.USER]: 'user',
  [R.BUSINESS]: 'common',
  [R.SUPERADMIN]: 'superadmin',
}

const Dashboard = () => {
  const { data } = useAuthSession()
  const user = data?.user
  const role = user?.role
  const { ready } = useTranslation(role ? namespaces[role] : 'common')

  if (!user || !role || !ready) {
    return <Skeleton />
  }

  const Component = gates[role]

  return (
    <Stack
      sx={{
        height: '100vh',
        width: '100vw',
        alignItems: 'center',
        overflow: { xs: 'hidden', md: 'auto' },
      }}
    >
      <Component />
    </Stack>
  )
}

export default Dashboard
