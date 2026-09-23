import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'

import {
  answerCardQuestion,
  applyCardAnswers,
  generateCardQuestions,
  getCardQuestions,
} from '@/api/http/cards'
import type { CardDetails } from '@/types/ProjectCard'

import { cardError } from './cardError'

export interface ClarificationProps {
  cardId: string
  disabled: boolean
  onApplied: (card: CardDetails) => Promise<void>
  onPrepare: () => Promise<void>
  onBusy: (busy: boolean) => void
  onDirty: (dirty: boolean) => void
}

const useCardClarifications = ({
  cardId,
  disabled,
  onApplied,
  onPrepare,
  onBusy,
  onDirty,
}: ClarificationProps) => {
  const [answers, setAnswers] = useState<Partial<Record<string, string>>>({})
  const [activeId, setActiveId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [requestError, setRequestError] = useState<string | null>(null)
  const running = useRef(false)
  const retry = useRef<{ id: string; answer: string } | null>(null)
  const questions = useQuery({
    queryKey: ['card-questions', cardId],
    queryFn: async () => {
      const existing = await getCardQuestions(cardId)
      return existing.length ? existing : generateCardQuestions(cardId)
    },
    retry: false,
    staleTime: Infinity,
  })
  const active =
    questions.data?.find((question) => question.id === activeId) ??
    questions.data?.find((question) => !question.answer?.trim())
  useEffect(() => {
    const changed = questions.data?.some(
      (question) =>
        answers[question.id] !== undefined &&
        answers[question.id]?.trim() !== (question.answer ?? '').trim()
    )
    onDirty(Boolean(changed || requestError))
  }, [answers, onDirty, questions.data, requestError])
  const commit = async (id: string, answer: string, force = false) => {
    const previous =
      questions.data?.find((question) => question.id === id)?.answer ?? ''
    if (
      disabled ||
      running.current ||
      !answer.trim() ||
      (!force && answer.trim() === previous.trim())
    ) {
      return
    }
    running.current = true
    setBusy(true)
    onBusy(true)
    setRequestError(null)
    retry.current = { id, answer }
    try {
      await onPrepare()
      await answerCardQuestion(cardId, id, answer)
      const card = await applyCardAnswers(cardId)
      await onApplied(card)
      await questions.refetch()
      setAnswers((current) =>
        Object.fromEntries(
          Object.entries(current).filter(([key]) => key !== id)
        )
      )
      setActiveId(null)
      retry.current = null
    } catch (error) {
      setRequestError(cardError(error))
    } finally {
      running.current = false
      setBusy(false)
      onBusy(false)
    }
  }
  const more = async () => {
    if (disabled || running.current) {
      return
    }
    running.current = true
    setBusy(true)
    onBusy(true)
    setRequestError(null)
    try {
      await onPrepare()
      await generateCardQuestions(cardId)
      await questions.refetch()
    } catch (error) {
      setRequestError(cardError(error))
    } finally {
      running.current = false
      setBusy(false)
      onBusy(false)
    }
  }
  const voiceAnswer = async (text: string) => {
    if (!active) {
      return
    }
    const answer = text.slice(0, 10_000)
    setAnswers((current) => ({ ...current, [active.id]: answer }))
    await commit(active.id, answer)
  }
  const retryApply = async () => {
    const pending = retry.current
    if (pending) {
      await commit(pending.id, pending.answer, true)
    } else {
      await more()
    }
  }
  return {
    questions,
    active,
    setActiveId,
    answers,
    setAnswers,
    busy,
    requestError,
    commit,
    more,
    voiceAnswer,
    retryApply,
  }
}
export default useCardClarifications
