import Fade from '@mui/material/Fade'
import Typography from '@mui/material/Typography'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as THREE from 'three'

import { useThemeColors } from '@/utils/useThemeColors'

import Hyperspeed from './react-bits/Hyperspeed'

const toHex = (color: string) => new THREE.Color(color).getHex()

const AppSuspense = () => {
  const { t } = useTranslation()
  const [showLoadingMessage, setShowLoadingMessage] = useState(false)
  const {
    background,
    divider,
    info,
    paper,
    primary,
    primaryLight,
    secondary,
    text,
    foreground,
  } = useThemeColors()

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setShowLoadingMessage(true)
    }, 3000)

    return () => window.clearTimeout(timeoutId)
  }, [])
  const effectOptions = useMemo(
    () => ({
      colors: {
        background: toHex(background),
        brokenLines: toHex(divider),
        islandColor: toHex(paper),
        leftCars: [toHex(primary), toHex(secondary), toHex(primaryLight)],
        rightCars: [toHex(secondary), toHex(primary), toHex(info)],
        roadColor: toHex(foreground),
        shoulderLines: toHex(text),
        sticks: toHex(secondary),
      },
    }),
    [
      background,
      divider,
      info,
      paper,
      primary,
      primaryLight,
      secondary,
      text,
      foreground,
    ]
  )

  return (
    <div
      style={{
        boxSizing: 'border-box',
        height: '100%',
        maxHeight: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        paddingBottom: 'var(--safe-bottom)',
        position: 'relative',
        width: '100%',
      }}
    >
      <Hyperspeed effectOptions={effectOptions} />
      <div
        aria-live="polite"
        style={{
          alignItems: 'center',
          display: 'flex',
          inset: 0,
          justifyContent: 'center',
          padding: '1rem',
          pointerEvents: 'none',
          position: 'absolute',
          textAlign: 'center',
          zIndex: 1,
        }}
      >
        <Fade in={showLoadingMessage} timeout={700}>
          <Typography
            sx={{
              color: foreground,
              letterSpacing: '0.12em',
              textShadow: '0 3px 8px rgba(0, 0, 0, 0.85)',
              textTransform: 'uppercase',
            }}
          >
            {t('loading.holdToSpeedUp')}
          </Typography>
        </Fade>
      </div>
    </div>
  )
}

export default AppSuspense
