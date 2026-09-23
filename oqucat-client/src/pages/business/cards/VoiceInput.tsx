import { Alert, Button, Stack } from '@mui/material'
import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from 'react'
import { useTranslation } from 'react-i18next'
import { MdMic, MdStop } from 'react-icons/md'

import { transcribeCardAudio } from '@/api/http/cards'

const VoiceInput = ({
  onText,
  disabled = false,
  onPhase,
  onStart,
  ref,
}: {
  onText: (text: string) => void | Promise<void>
  disabled?: boolean
  onPhase?: (phase: 'idle' | 'starting' | 'recording' | 'processing') => void
  onStart?: () => void
  ref?: Ref<{ toggle: () => void }>
}) => {
  const { t } = useTranslation('business')
  const [phase, setPhase] = useState<
    'idle' | 'starting' | 'recording' | 'processing'
  >('idle')
  const [error, setError] = useState(false)
  const recorder = useRef<MediaRecorder | null>(null)
  const stream = useRef<MediaStream | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abort = useRef<AbortController | null>(null)
  const mounted = useRef(true)
  const callback = useRef(onText)
  useEffect(() => {
    onPhase?.(phase)
  }, [phase, onPhase])
  useEffect(() => {
    callback.current = onText
  }, [onText])
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      abort.current?.abort()
      if (timer.current) {
        clearTimeout(timer.current)
      }
      if (recorder.current?.state === 'recording') {
        recorder.current.stop()
      }
      for (const track of stream.current?.getTracks() ?? []) {
        track.stop()
      }
    }
  }, [])

  const start = async () => {
    onStart?.()
    setError(false)
    setPhase('starting')
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (!mounted.current) {
        for (const track of media.getTracks()) {
          track.stop()
        }
        return
      }
      stream.current = media
      const mimeType = [
        'audio/webm;codecs=opus',
        'audio/ogg;codecs=opus',
        'audio/mp4',
      ].find((type) => MediaRecorder.isTypeSupported(type))
      const next = new MediaRecorder(media, mimeType ? { mimeType } : undefined)
      recorder.current = next
      const chunks: BlobPart[] = []
      next.ondataavailable = ({ data }) => {
        if (data.size) {
          chunks.push(data)
        }
      }
      next.onstop = () => {
        if (timer.current) {
          clearTimeout(timer.current)
        }
        for (const track of media.getTracks()) {
          track.stop()
        }
        if (!mounted.current) {
          return
        }
        setPhase('processing')
        const controller = new AbortController()
        abort.current = controller
        const transcribe = async () => {
          try {
            const text = await transcribeCardAudio(
              new Blob(chunks, { type: next.mimeType }),
              controller.signal
            )
            if (mounted.current) {
              await callback.current(text)
            }
          } catch {
            if (mounted.current) {
              setError(true)
            }
          } finally {
            if (mounted.current) {
              setPhase('idle')
            }
          }
        }
        void transcribe()
      }
      next.start()
      setPhase('recording')
      timer.current = setTimeout(() => {
        if (next.state === 'recording') {
          next.stop()
        }
      }, 60_000)
    } catch {
      for (const track of stream.current?.getTracks() ?? []) {
        track.stop()
      }
      if (mounted.current) {
        setError(true)
        setPhase('idle')
      }
    }
  }

  const toggle = () => {
    if (phase === 'recording') {
      recorder.current?.stop()
    } else if (!disabled && phase === 'idle') {
      void start()
    }
  }
  useImperativeHandle(ref, () => ({ toggle }))

  return (
    <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
      <Button
        disabled={
          (disabled && phase !== 'recording') ||
          phase === 'starting' ||
          phase === 'processing'
        }
        startIcon={phase === 'recording' ? <MdStop /> : <MdMic />}
        color={phase === 'recording' ? 'error' : 'primary'}
        onClick={toggle}
      >
        {t(`voice.${phase}`)}
      </Button>
      {error && <Alert severity="warning">{t('voice.error')}</Alert>}
    </Stack>
  )
}

export default VoiceInput
