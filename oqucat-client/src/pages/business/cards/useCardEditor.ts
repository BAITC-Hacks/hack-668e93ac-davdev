import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBlocker } from 'react-router-dom'

import {
  createCard,
  getCard,
  getCardReviews,
  generateCardQuestions,
  publishCard,
  reviewCard,
  updateCard,
} from '@/api/http/cards'
import { queryKeys } from '@/api/http/QueryKeys'
import { useAuthSession } from '@/auth/betterAuth'
import type { CardDetails, CardReview } from '@/types/ProjectCard'

import { cardError } from './cardError'
import { cardInput } from './cardForm'
import { editableFields, parseFields } from './dynamicFieldValues'

const useCardEditor = (
  initial: CardDetails | undefined,
  onCreated: (card: CardDetails) => void
) => {
  const { t } = useTranslation('business')
  const { data: session } = useAuthSession()
  const queryClient = useQueryClient()
  const [saved, setSaved] = useState(initial)
  const [input, setInput] = useState(() => cardInput(initial))
  const [fields, setFields] = useState(() =>
    editableFields(cardInput(initial).fields)
  )
  const [baseline, setBaseline] = useState(() =>
    JSON.stringify({
      input: cardInput(initial),
      fields: editableFields(cardInput(initial).fields),
    })
  )
  const [review, setReview] = useState<CardReview | null>(null)
  const [busy, setBusy] = useState(false)
  const [requestError, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [answersDirty, setAnswersDirty] = useState(false)
  const dirty = baseline !== JSON.stringify({ input, fields })
  const navigatingAfterSave = useRef(false)
  const blocker = useBlocker(
    () => !navigatingAfterSave.current && (dirty || busy || answersDirty)
  )
  const reviews = useQuery({
    queryKey: ['card-reviews', saved?.card.id],
    queryFn: () => getCardReviews(saved?.card.id ?? ''),
    enabled: Boolean(saved),
    retry: false,
  })
  const currentReview = review ?? reviews.data?.find((item) => item.is_current)
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty || busy || answersDirty) {
        event.preventDefault()
      }
    }
    globalThis.addEventListener('beforeunload', warn)
    return () => globalThis.removeEventListener('beforeunload', warn)
  }, [dirty, busy, answersDirty])
  const replace = (card: CardDetails) => {
    const next = cardInput(card)
    const nextFields = editableFields(next.fields)
    setSaved(card)
    setInput(next)
    setFields(nextFields)
    setBaseline(JSON.stringify({ input: next, fields: nextFields }))
    setReview(null)
    queryClient.setQueryData(['card-reviews', card.card.id], [])
  }
  const refresh = async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.marketplace(session?.user?.id),
    })
    await queryClient.invalidateQueries({ queryKey: ['card-reviews'] })
  }
  const evaluateCard = async (card: CardDetails) => {
    const rating = await reviewCard(card.card.id)
    const updated = await getCard(card.card.id)
    replace(updated)
    setReview(rating)
    setNotice(t('evaluated'))
    return updated
  }
  const save = async (evaluate: boolean) => {
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      const payload = {
        ...input,
        title: input.title.trim(),
        fields: parseFields(fields),
      }
      if (!payload.title) {
        throw new Error('title_required')
      }
      const card = saved
        ? await updateCard(saved.card.id, payload)
        : await createCard(payload)
      replace(card)
      if (!saved) {
        await refresh()
        navigatingAfterSave.current = true
        onCreated(card)
        return
      }
      setNotice(t('saved'))
      if (evaluate || card.card.status === 'published') {
        await evaluateCard(card)
      }
      await refresh()
    } catch (error) {
      setError(cardError(error))
      await refresh()
    } finally {
      setBusy(false)
    }
  }
  const applied = async (card: CardDetails) => {
    replace(card)
    setNotice(t('questions.applied'))
    try {
      const updated = await evaluateCard(card)
      if (updated.card.completeness_score < 40) {
        await generateCardQuestions(card.card.id)
        await queryClient.invalidateQueries({
          queryKey: ['card-questions', card.card.id],
        })
      }
    } catch (error) {
      setError(cardError(error))
    }
    await refresh()
  }
  const prepareAnswers = async () => {
    if (saved && dirty) {
      const payload = {
        ...input,
        title: input.title.trim(),
        fields: parseFields(fields),
      }
      if (!payload.title) {
        throw new Error('title_required')
      }
      replace(await updateCard(saved.card.id, payload))
    }
  }
  const publish = async () => {
    if (!saved || !currentReview || dirty || answersDirty) {
      return false
    }
    setBusy(true)
    setError(null)
    try {
      replace(await publishCard(saved.card.id, currentReview.id))
      setNotice(t('published'))
      await refresh()
      return true
    } catch (error) {
      setError(cardError(error))
      return false
    } finally {
      setBusy(false)
    }
  }
  return {
    saved,
    input,
    setInput,
    fields,
    setFields,
    busy,
    setBusy,
    error: requestError,
    notice,
    dirty,
    answersDirty,
    blocker,
    reviews,
    currentReview,
    save,
    publish,
    applied,
    prepareAnswers,
    setAnswersDirty,
  }
}
export default useCardEditor
