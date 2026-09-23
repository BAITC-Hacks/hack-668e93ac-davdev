import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FaAndroid,
  FaApple,
  FaChrome,
  FaEdge,
  FaFirefoxBrowser,
  FaSafari,
  FaWindows,
} from 'react-icons/fa6'
import {
  MdComputer,
  MdLanguage,
  MdLogout as LogoutIcon,
  MdPhoneAndroid,
  MdTabletAndroid,
} from 'react-icons/md'

import { authClient } from '@/auth/betterAuth'
import { notify } from '@/context/notification/notify'

interface AuthSession {
  id: string
  token: string
  updatedAt: string | Date
  ipAddress?: string | null
  userAgent?: string | null
}

type Browser = 'Chrome' | 'Firefox' | 'Microsoft Edge' | 'Safari' | 'Browser'
type OperatingSystem =
  | 'Android'
  | 'iOS'
  | 'Linux'
  | 'macOS'
  | 'Windows'
  | 'Unknown platform'
type Device = 'desktop' | 'mobile' | 'tablet' | 'unknown'

interface SessionDevice {
  browser: Browser
  operatingSystem: OperatingSystem
  device: Device
}

const isAuthSession = (value: unknown): value is AuthSession => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const id = Reflect.get(value, 'id') as unknown
  const token = Reflect.get(value, 'token') as unknown
  const updatedAt = Reflect.get(value, 'updatedAt') as unknown
  const ipAddress = Reflect.get(value, 'ipAddress') as unknown
  const userAgent = Reflect.get(value, 'userAgent') as unknown

  return (
    typeof id === 'string' &&
    typeof token === 'string' &&
    (typeof updatedAt === 'string' || updatedAt instanceof Date) &&
    (ipAddress === undefined ||
      ipAddress === null ||
      typeof ipAddress === 'string') &&
    (userAgent === undefined ||
      userAgent === null ||
      typeof userAgent === 'string')
  )
}

const formatDate = (value: Date | string, locale?: string) =>
  new Intl.DateTimeFormat(locale ?? undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

const getSessionDevice = (userAgent = ''): SessionDevice => {
  const browser: Browser = /(?:Edg|EdgiOS|EdgA)\//u.test(userAgent)
    ? 'Microsoft Edge'
    : /(?:Firefox|FxiOS)\//u.test(userAgent)
      ? 'Firefox'
      : /(?:Chrome|CriOS)\//u.test(userAgent)
        ? 'Chrome'
        : /Version\/[^ ]+.*Safari\//u.test(userAgent)
          ? 'Safari'
          : 'Browser'
  const operatingSystem: OperatingSystem = /Android/iu.test(userAgent)
    ? 'Android'
    : /(?:iPhone|iPad|iPod)/iu.test(userAgent)
      ? 'iOS'
      : /Windows/iu.test(userAgent)
        ? 'Windows'
        : /Mac OS X/iu.test(userAgent)
          ? 'macOS'
          : /Linux/iu.test(userAgent)
            ? 'Linux'
            : 'Unknown platform'
  const device: Device = /(?:iPad|Tablet)/iu.test(userAgent)
    ? 'tablet'
    : /(?:Android.*Mobile|iPhone|iPod)/iu.test(userAgent)
      ? 'mobile'
      : operatingSystem === 'Unknown platform'
        ? 'unknown'
        : 'desktop'

  return { browser, operatingSystem, device }
}

const renderSessionBrowserIcon = (browser: Browser) => {
  if (browser === 'Chrome') {
    return <FaChrome size={20} />
  }

  if (browser === 'Safari') {
    return <FaSafari size={20} />
  }

  if (browser === 'Firefox') {
    return <FaFirefoxBrowser size={20} />
  }

  if (browser === 'Microsoft Edge') {
    return <FaEdge size={20} />
  }

  return <MdLanguage size={20} />
}

const renderSessionOperatingSystemIcon = (operatingSystem: OperatingSystem) => {
  if (operatingSystem === 'Windows') {
    return <FaWindows size={20} />
  }

  if (operatingSystem === 'Android') {
    return <FaAndroid size={20} />
  }

  if (operatingSystem === 'iOS' || operatingSystem === 'macOS') {
    return <FaApple size={20} />
  }

  return <MdLanguage size={20} />
}

const renderSessionDeviceIcon = (device: Device) => {
  if (device === 'mobile') {
    return <MdPhoneAndroid size={20} />
  }

  if (device === 'tablet') {
    return <MdTabletAndroid size={20} />
  }

  return <MdComputer size={20} />
}

const SessionsSection = () => {
  const { t } = useTranslation()
  const { data: currentSession } = authClient.useSession()
  const [sessions, setSessions] = useState<AuthSession[]>([])
  const [loading, setLoading] = useState(true)
  const [revokingToken, setRevokingToken] = useState<string | null>(null)
  const [revokingOthers, setRevokingOthers] = useState(false)

  const loadSessions = useCallback(async () => {
    const { data, error } = await authClient.listSessions()

    if (error) {
      notify.error(error.message ?? t('common:profile.sessions.loadFailed'))
      return
    }

    setSessions(
      Array.isArray(data)
        ? data.filter((session) => isAuthSession(session))
        : []
    )
  }, [t])

  useEffect(() => {
    const load = async () => {
      await loadSessions()
      setTimeout(() => setLoading(false), 0)
    }

    void load()
  }, [loadSessions])

  const handleRevokeSession = async (token: string) => {
    setRevokingToken(token)

    try {
      const { error } = await authClient.revokeSession({ token })

      if (error) {
        notify.error(error.message ?? t('common:profile.sessions.manageFailed'))
        return
      }

      setSessions((current) =>
        current.filter((session) => session.token !== token)
      )
      notify.success(t('common:profile.sessions.revoked'))
    } finally {
      setRevokingToken(null)
    }
  }

  const handleRevokeOtherSessions = async () => {
    setRevokingOthers(true)

    try {
      const { error } = await authClient.revokeOtherSessions()

      if (error) {
        notify.error(error.message ?? t('common:profile.sessions.manageFailed'))
        return
      }

      setSessions((current) =>
        current.filter(
          (session) => session.token === currentSession?.session.token
        )
      )
      notify.success(t('common:profile.sessions.otherSessionsRevoked'))
    } finally {
      setRevokingOthers(false)
    }
  }

  const otherSessionsCount = sessions.filter(
    (session) => session.token !== currentSession?.session.token
  ).length

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">
        {t('common:profile.sessions.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t('common:profile.sessions.description')}
      </Typography>

      {!loading && sessions.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t('common:profile.sessions.empty')}
        </Typography>
      ) : null}

      {sessions.length > 0 ? (
        <Paper variant="outlined" sx={{ px: 2 }}>
          <Stack divider={<Divider />}>
            {sessions.map((session) => {
              const isCurrent = session.token === currentSession?.session.token
              const device = getSessionDevice(session.userAgent ?? undefined)

              return (
                <Stack
                  key={session.id}
                  direction="row"
                  spacing={1}
                  sx={{ py: 1, alignItems: 'center' }}
                >
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{ color: isCurrent ? 'primary.main' : 'action.active' }}
                  >
                    <Tooltip
                      title={t(
                        `common:profile.sessions.devices.${device.device}`
                      )}
                    >
                      <span>{renderSessionDeviceIcon(device.device)}</span>
                    </Tooltip>
                    <Tooltip title={device.operatingSystem}>
                      <span>
                        {renderSessionOperatingSystemIcon(
                          device.operatingSystem
                        )}
                      </span>
                    </Tooltip>
                    <Tooltip title={device.browser}>
                      <span>{renderSessionBrowserIcon(device.browser)}</span>
                    </Tooltip>
                  </Stack>
                  <Stack sx={{ minWidth: 0, flex: 1 }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                    >
                      <Typography noWrap>
                        {`${t(
                          `common:profile.sessions.devices.${device.device}`
                        )} · ${device.operatingSystem} · ${device.browser}`}
                      </Typography>
                      {isCurrent ? (
                        <Chip
                          label={t('common:profile.sessions.current')}
                          color="primary"
                          size="small"
                        />
                      ) : null}
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {t('common:profile.sessions.lastActive', {
                        date: formatDate(
                          session.updatedAt,
                          currentSession?.user.locale ?? undefined
                        ),
                      })}
                      {session.ipAddress ? ` · ${session.ipAddress}` : ''}
                    </Typography>
                  </Stack>
                  {isCurrent ? null : (
                    <Tooltip title={t('common:profile.sessions.revoke')}>
                      <IconButton
                        aria-label={t('common:profile.sessions.revoke')}
                        color="error"
                        onClick={() => void handleRevokeSession(session.token)}
                        loading={revokingToken === session.token}
                        disabled={revokingOthers}
                      >
                        <LogoutIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              )
            })}
          </Stack>
        </Paper>
      ) : null}

      <Button
        color="error"
        variant="outlined"
        startIcon={<LogoutIcon />}
        onClick={() => void handleRevokeOtherSessions()}
        loading={revokingOthers}
        disabled={otherSessionsCount === 0 || revokingToken !== null}
      >
        {t('common:profile.sessions.revokeOthers')}
      </Button>
    </Stack>
  )
}

export default SessionsSection
