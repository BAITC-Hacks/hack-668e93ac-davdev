import {
  useCallback,
  useImperativeHandle,
  useRef,
  type ForwardedRef,
  type RefObject,
} from 'react'
import * as THREE from 'three'

import type { VasyaExpression } from './VasyaExpressions'

export type VasyaAssistantActivity =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'talking'

export interface VasyaHandle {
  wave: () => void
  blink: () => void
  setColor: (color: THREE.ColorRepresentation) => void
  lookAt: (x: number, y: number) => void
  clearLookAt: () => void
  showExpression: (expression: VasyaExpression, durationMs?: number) => void
  neutral: () => void
  surprised: (durationMs?: number) => void
  thinking: (durationMs?: number) => void
  unsure: (durationMs?: number) => void
  happy: (durationMs?: number) => void
  sad: (durationMs?: number) => void
  watchingYou: () => void
  listening: () => void
  setAssistantActivity: (activity: VasyaAssistantActivity) => void
}

interface VasyaControls {
  waving: RefObject<boolean>
  waveTime: RefObject<number>
  blinkTimer: RefObject<number>
  blinkProgress: RefObject<number>
  blinking: RefObject<boolean>
  lookTarget: RefObject<THREE.Vector2 | null>
  expression: RefObject<VasyaExpression>
  expressionTime: RefObject<number>
  expressionDuration: RefObject<number>
  watching: RefObject<boolean>
  watchingTime: RefObject<number>
  listening: RefObject<boolean>
  listeningTime: RefObject<number>
  assistantActivity: RefObject<VasyaAssistantActivity>
  thinkingTime: RefObject<number>
  talkingTime: RefObject<number>
  startWave: () => void
  setColor: (color: THREE.ColorRepresentation) => void
}

export function useVasyaControls(
  ref: ForwardedRef<VasyaHandle>,
  colorMaterials: THREE.Material[]
): VasyaControls {
  const waving = useRef(false)
  const waveTime = useRef(0)
  const blinkTimer = useRef(2)
  const blinkProgress = useRef(0)
  const blinking = useRef(false)
  const lookTarget = useRef<THREE.Vector2 | null>(null)
  const expression = useRef<VasyaExpression>('neutral')
  const expressionTime = useRef(0)
  const expressionDuration = useRef(0)
  const watching = useRef(false)
  const watchingTime = useRef(0)
  const listening = useRef(false)
  const listeningTime = useRef(0)
  const assistantActivity = useRef<VasyaAssistantActivity>('idle')
  const thinkingTime = useRef(0)
  const talkingTime = useRef(0)

  const startWave = useCallback(() => {
    watching.current = false
    listening.current = false
    waveTime.current = 0
    waving.current = true
  }, [])

  const startBlink = useCallback(() => {
    blinking.current = true
    blinkProgress.current = 0
  }, [])

  const setColor = useCallback(
    (color: THREE.ColorRepresentation) => {
      for (const material of colorMaterials) {
        if ('color' in material && material.color instanceof THREE.Color) {
          material.color.set(color)
          material.needsUpdate = true
        }
      }
    },
    [colorMaterials]
  )

  const showExpression = useCallback(
    (next: VasyaExpression, durationMs = 2000) => {
      expression.current = next
      expressionTime.current = 0
      expressionDuration.current = Math.max(0, durationMs) / 1000
    },
    []
  )

  const showNeutral = useCallback(() => {
    expression.current = 'neutral'
    expressionTime.current = 0
    expressionDuration.current = 0
  }, [])

  const startWatching = useCallback(() => {
    waving.current = false
    listening.current = false
    watchingTime.current = 0
    watching.current = true
    expression.current = 'watching'
    expressionTime.current = 0
    expressionDuration.current = 3.2
  }, [])

  const startListening = useCallback(() => {
    assistantActivity.current = 'idle'
    waving.current = false
    watching.current = false
    listeningTime.current = 0
    listening.current = true
    expression.current = 'listening'
    expressionTime.current = 0
    expressionDuration.current = 3.2
  }, [])

  const setAssistantActivity = useCallback(
    (activity: VasyaAssistantActivity) => {
      assistantActivity.current = activity
      waving.current = false
      watching.current = false
      listening.current = false
      listeningTime.current = 0
      thinkingTime.current = 0
      talkingTime.current = 0

      switch (activity) {
        case 'idle': {
          expression.current = 'neutral'
          expressionTime.current = 0
          expressionDuration.current = 0
          break
        }
        case 'listening': {
          expression.current = 'listening'
          break
        }
        case 'thinking': {
          expression.current = 'thinking'
          break
        }
        case 'talking': {
          expression.current = 'happy'
          break
        }
        default: {
          break
        }
      }

      if (activity !== 'idle') {
        expressionTime.current = 0
        expressionDuration.current = Number.POSITIVE_INFINITY
      }
    },
    []
  )

  useImperativeHandle(
    ref,
    () => ({
      wave: startWave,
      blink: startBlink,
      setColor,
      lookAt: (x, y) => {
        lookTarget.current = new THREE.Vector2(x, y)
      },
      clearLookAt: () => {
        lookTarget.current = null
      },
      showExpression,
      neutral: showNeutral,
      surprised: (durationMs) => showExpression('surprised', durationMs),
      thinking: (durationMs) => showExpression('thinking', durationMs),
      unsure: (durationMs) => showExpression('unsure', durationMs),
      happy: (durationMs) => showExpression('happy', durationMs),
      sad: (durationMs) => showExpression('sad', durationMs),
      watchingYou: startWatching,
      listening: startListening,
      setAssistantActivity,
    }),
    [
      setAssistantActivity,
      setColor,
      showExpression,
      showNeutral,
      startBlink,
      startListening,
      startWatching,
      startWave,
    ]
  )

  return {
    waving,
    waveTime,
    blinkTimer,
    blinkProgress,
    blinking,
    lookTarget,
    expression,
    expressionTime,
    expressionDuration,
    watching,
    watchingTime,
    listening,
    listeningTime,
    assistantActivity,
    thinkingTime,
    talkingTime,
    startWave,
    setColor,
  }
}
