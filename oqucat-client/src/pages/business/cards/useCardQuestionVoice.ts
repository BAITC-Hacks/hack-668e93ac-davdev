import { useCallback, useEffect, useRef, useState } from 'react'

import { getCardQuestionVoice } from '@/api/http/cards'

const useCardQuestionVoice = (cardId?: string, questionId?: string) => {
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const context = useRef<AudioContext | null>(null)
  const source = useRef<AudioBufferSourceNode | null>(null)
  const request = useRef<AbortController | null>(null)
  const enabled = useRef(false)
  const stop = useCallback(() => {
    request.current?.abort()
    if (source.current) {
      source.current.stop()
      source.current = null
    }
    setPlaying(false)
    setLoading(false)
  }, [])
  const speak = useCallback(async () => {
    if (!cardId || !questionId) {
      return
    }
    stop()
    enabled.current = true
    setFailed(false)
    setLoading(true)
    const controller = new AbortController()
    request.current = controller
    try {
      const audioContext = context.current ?? new AudioContext()
      context.current = audioContext
      await audioContext.resume()
      const audio = await getCardQuestionVoice(
        cardId,
        questionId,
        controller.signal
      )
      const buffer = await audioContext.decodeAudioData(audio)
      if (controller.signal.aborted) {
        return
      }
      const next = audioContext.createBufferSource()
      next.buffer = buffer
      next.connect(audioContext.destination)
      source.current = next
      next.addEventListener(
        'ended',
        () => {
          if (source.current === next) {
            source.current = null
            setPlaying(false)
          }
        },
        { once: true }
      )
      setPlaying(true)
      setLoading(false)
      next.start()
    } catch {
      if (!controller.signal.aborted) {
        setFailed(true)
        setLoading(false)
      }
    }
  }, [cardId, questionId, stop])
  useEffect(() => {
    if (enabled.current) {
      void speak()
    }
    return stop
  }, [speak, stop])
  useEffect(
    () => () => {
      void context.current?.close()
    },
    []
  )
  const listen = () => {
    enabled.current = true
    stop()
  }
  const pause = () => {
    enabled.current = false
    stop()
  }
  return { playing, loading, failed, speak, listen, pause }
}
export default useCardQuestionVoice
