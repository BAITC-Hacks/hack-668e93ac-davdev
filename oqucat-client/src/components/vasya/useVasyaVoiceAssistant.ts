/* oxlint-disable react/preserve-manual-memoization -- Imperative media and Three.js refs intentionally live outside React state. */

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { useTranslation } from 'react-i18next'

import { getAssistantVoiceResponse } from '@/api/http/assistant'
import { authClient } from '@/auth/betterAuth'
import { notify } from '@/context/notification/notify'
import { isLanguage } from '@/types/Languages'
import getLocale from '@/utils/getLocale'

import type { VasyaHandle } from './Vasya'

type AssistantPhase = 'idle' | 'listening' | 'thinking' | 'talking'

const MAX_RECORDING_DURATION_MS = 30_000
const SILENCE_DURATION_MS = 1200
const SPEECH_THRESHOLD = 0.018
const RECORDING_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/ogg;codecs=opus',
  'audio/webm',
  'audio/ogg',
]

const getRecordingMimeType = () =>
  RECORDING_MIME_TYPES.find((mimeType) =>
    MediaRecorder.isTypeSupported(mimeType)
  )

const getVolume = (samples: Float32Array) => {
  let total = 0

  for (const sample of samples) {
    total += sample ** 2
  }

  return Math.sqrt(total / samples.length)
}

export const useVasyaVoiceAssistant = (
  vasya: RefObject<VasyaHandle | null>
) => {
  const { i18n, t } = useTranslation()
  const { data: session, isPending } = authClient.useSession()
  const [phase, setPhase] = useState<AssistantPhase>('idle')
  const audioContext = useRef<AudioContext | null>(null)
  const audioSource = useRef<AudioBufferSourceNode | null>(null)
  const animationFrameId = useRef<number | null>(null)
  const recorder = useRef<MediaRecorder | null>(null)
  const recordingTimeout = useRef<number | null>(null)
  const stream = useRef<MediaStream | null>(null)

  const clearRecording = useCallback(() => {
    if (animationFrameId.current !== null) {
      globalThis.cancelAnimationFrame(animationFrameId.current)
      animationFrameId.current = null
    }

    if (recordingTimeout.current !== null) {
      globalThis.clearTimeout(recordingTimeout.current)
      recordingTimeout.current = null
    }

    const tracks = stream.current?.getTracks() ?? []

    for (const track of tracks) {
      track.stop()
    }
    stream.current = null
    recorder.current = null
  }, [])

  const returnToIdle = useCallback(() => {
    audioSource.current?.stop()
    audioSource.current = null
    clearRecording()
    vasya.current?.setAssistantActivity('idle')
    setPhase('idle')
  }, [clearRecording, vasya])

  const playResponse = useCallback(
    async (audio: ArrayBuffer) => {
      const context = audioContext.current

      if (!context) {
        returnToIdle()
        return
      }

      const buffer = await context.decodeAudioData(audio)
      const source = context.createBufferSource()

      source.buffer = buffer
      source.connect(context.destination)
      source.addEventListener('ended', returnToIdle, { once: true })
      audioSource.current = source
      vasya.current?.setAssistantActivity('talking')
      setPhase('talking')
      source.start()
    },
    [returnToIdle, vasya]
  )

  const playGreeting = useCallback(async () => {
    const context = audioContext.current ?? new AudioContext()
    audioContext.current = context

    try {
      await context.resume()

      const locale = getLocale(i18n)
      const greetingLocale = isLanguage(locale) ? locale : 'en'
      const response = await fetch(`/sounds/greet_${greetingLocale}.ogg`)

      if (!response.ok) {
        throw new Error(`Unable to load greeting: ${response.status}`)
      }

      await playResponse(await response.arrayBuffer())
    } catch {
      returnToIdle()
    }
  }, [i18n, playResponse, returnToIdle])

  const processRecording = useCallback(
    async (audio: Blob) => {
      clearRecording()
      vasya.current?.setAssistantActivity('thinking')
      setPhase('thinking')

      const response = await getAssistantVoiceResponse(
        audio,
        i18n.resolvedLanguage ?? i18n.language
      )

      if (!response) {
        notify.error(t('assistant.requestFailed'))
        returnToIdle()
        return
      }

      await playResponse(response)
    },
    [
      clearRecording,
      i18n.language,
      i18n.resolvedLanguage,
      playResponse,
      returnToIdle,
      t,
      vasya,
    ]
  )

  const start = useCallback(async () => {
    if (phase !== 'idle' || isPending) {
      return
    }

    if (session?.user) {
      try {
        const nextStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        })
        const context = audioContext.current ?? new AudioContext()

        audioContext.current = context
        await context.resume()
        stream.current = nextStream

        const analyser = context.createAnalyser()
        const input = context.createMediaStreamSource(nextStream)
        const samples = new Float32Array(analyser.fftSize)
        const chunks: BlobPart[] = []
        let hasSpeech = false
        let lastSpeechAt = 0

        input.connect(analyser)

        const recordingMimeType = getRecordingMimeType()
        const nextRecorder = new MediaRecorder(
          nextStream,
          recordingMimeType ? { mimeType: recordingMimeType } : undefined
        )

        recorder.current = nextRecorder
        nextRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data)
          }
        }
        nextRecorder.onstop = () => {
          input.disconnect()
          analyser.disconnect()

          if (!hasSpeech || chunks.length === 0) {
            returnToIdle()
            return
          }

          const recordedMimeType =
            nextRecorder.mimeType.length > 0
              ? nextRecorder.mimeType
              : (recordingMimeType ?? 'audio/ogg')

          void processRecording(new Blob(chunks, { type: recordedMimeType }))
        }
        nextRecorder.start()
        vasya.current?.setAssistantActivity('listening')
        setPhase('listening')

        const detectSpeech = () => {
          analyser.getFloatTimeDomainData(samples)

          const now = performance.now()

          if (getVolume(samples) >= SPEECH_THRESHOLD) {
            hasSpeech = true
            lastSpeechAt = now
          }

          if (hasSpeech && now - lastSpeechAt >= SILENCE_DURATION_MS) {
            nextRecorder.stop()
            return
          }

          animationFrameId.current =
            globalThis.requestAnimationFrame(detectSpeech)
        }

        animationFrameId.current =
          globalThis.requestAnimationFrame(detectSpeech)
        recordingTimeout.current = globalThis.setTimeout(() => {
          if (nextRecorder.state === 'recording') {
            nextRecorder.stop()
          }
        }, MAX_RECORDING_DURATION_MS)
      } catch {
        notify.error(t('assistant.microphoneUnavailable'))
        returnToIdle()
      }
    } else {
      void playGreeting()
    }
  }, [
    isPending,
    phase,
    playGreeting,
    processRecording,
    returnToIdle,
    session,
    t,
    vasya,
  ])

  useEffect(
    () => () => {
      returnToIdle()
      void audioContext.current?.close()
    },
    [returnToIdle]
  )

  return { phase, start }
}
