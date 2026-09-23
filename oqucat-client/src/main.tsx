/* oxlint-disable import/no-unassigned-import */

import CssBaseline from '@mui/material/CssBaseline'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'

import AppSuspense from './components/AppSuspense.tsx'
import RootLayout from './components/RootLayout.tsx'
import WithAuth from './components/WithAuth.tsx'
import { appName, appVersion } from './config.ts'

import './index.css'

import './firebase'
import './i18n'
import { AppThemeProvider } from './context/theme/AppThemeProvider.tsx'
import ConfirmEmail from './pages/common/auth/dialogs/ConfirmEmail.tsx'
import ResetPassword from './pages/common/auth/dialogs/ResetPassword.tsx'
import Login from './pages/common/auth/Login.tsx'
import TwoFactorVerification from './pages/common/auth/TwoFactorVerification.tsx'
import ForgotPassword from './pages/common/auth/widgets/ForgotPassword.tsx'
import Dashboard from './pages/common/Dashboard.tsx'
import ErrorPage from './pages/common/ErrorPage.tsx'
import Landing from './pages/common/landing/Landing.tsx'
import { UserRole as R } from './types/UserRole.ts'
import logger from './utils/logger.ts'

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { element: <Landing />, path: '/' },
      { element: <ErrorPage />, path: '/error' },
      {
        element: <Login />,
        path: '/login',
      },
      {
        element: <TwoFactorVerification />,
        path: '/two-factor',
      },
      {
        element: (
          <WithAuth roles={[R.USER, R.SUPERADMIN]}>
            <Dashboard />
          </WithAuth>
        ),
        path: '/menu',
      },
      {
        element: <ConfirmEmail />,
        path: '/confirm-email',
      },
      {
        element: <ResetPassword />,
        path: '/reset-password',
      },
      {
        element: <ForgotPassword />,
        path: '/forgot-password',
      },
      { element: <Navigate to="/" />, path: '*' },
    ],
  },
])

const root = document.querySelector('#root')

logger.info(`Welcome to ${appName} v${appVersion}`)

if (!root) {
  throw new Error('Root element not found')
}
if (import.meta.env.DEV) {
  void (async () => {
    const { initClickToSource } = await import('@bakdotdev/dev-tools')

    initClickToSource({})
  })()
}

createRoot(root).render(
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <AppThemeProvider>
      <CssBaseline />
      <Suspense fallback={<AppSuspense />}>
        <RouterProvider router={router} />
      </Suspense>
    </AppThemeProvider>
  </LocalizationProvider>
)
