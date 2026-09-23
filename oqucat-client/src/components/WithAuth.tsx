import CircularProgress from '@mui/material/CircularProgress'
import type { JSX } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useAuthSession } from '@/auth/betterAuth'
import type { UserRole } from '@/types/UserRole'

interface IWithAuth {
  children: JSX.Element
  roles: UserRole[]
}

const WithAuth = ({ children, roles }: IWithAuth) => {
  const { data, isPending } = useAuthSession()
  const user = data?.user

  const location = useLocation()

  if (isPending) {
    return <CircularProgress />
  }

  if (user?.role && roles.includes(user.role)) {
    return children
  }

  return <Navigate to={`/login?back=${location.pathname}`} replace />
}

export default WithAuth
