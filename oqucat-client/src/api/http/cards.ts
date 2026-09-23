import { isAxiosError } from 'axios'

import type { MarketplaceTag } from '@/types/Marketplace'
import type {
  CardCatalog,
  CardDetails,
  CardFilters,
  CardInput,
  CardClarification,
  CardReview,
  ProjectCard,
} from '@/types/ProjectCard'

import { host } from '.'

export const getCards = async (filters: CardFilters, signal?: AbortSignal) => {
  const { data } = await host.get<CardCatalog>('cards/catalog', {
    params: filters,
    signal,
  })
  return data
}

export const getCard = async (id: string, signal?: AbortSignal) => {
  const { data } = await host.get<CardDetails>(
    `cards/${encodeURIComponent(id)}`,
    { signal }
  )
  return data
}

const cardPath = (id: string) => `cards/${encodeURIComponent(id)}`
export const getCardQuestionVoice = async (
  id: string,
  questionId: string,
  signal?: AbortSignal
) => {
  const { data } = await host.post<ArrayBuffer>(
    `${cardPath(id)}/clarifications/${encodeURIComponent(questionId)}/voice`,
    {},
    { signal, responseType: 'arraybuffer' }
  )
  return data
}
export const getMyCards = async (signal?: AbortSignal) =>
  (await host.get<CardDetails[]>('cards/mine', { signal })).data
export const createCard = async (input: CardInput) =>
  (await host.post<CardDetails>('cards', input)).data
export const updateCard = async (id: string, input: CardInput) =>
  (await host.patch<CardDetails>(cardPath(id), input)).data
export const generateCard = async (
  description: string,
  creation_method: ProjectCard['creation_method']
) =>
  (
    await host.post<CardDetails>('cards/drafts/ai', {
      description,
      creation_method,
    })
  ).data
export const publishCard = async (id: string, reviewId: string) =>
  (
    await host.post<CardDetails>(`${cardPath(id)}/publish`, {
      confirmed: true,
      review_id: reviewId,
    })
  ).data
export const getCardQuestions = async (id: string) =>
  (await host.get<CardClarification[]>(`${cardPath(id)}/clarifications`)).data
export const generateCardQuestions = async (id: string) =>
  (
    await host.post<CardClarification[]>(
      `${cardPath(id)}/clarifications/generate`
    )
  ).data
export const answerCardQuestion = async (
  id: string,
  questionId: string,
  answer: string
) =>
  (
    await host.patch<CardClarification>(
      `${cardPath(id)}/clarifications/${encodeURIComponent(questionId)}`,
      { answer }
    )
  ).data
export const applyCardAnswers = async (id: string) =>
  (await host.post<CardDetails>(`${cardPath(id)}/clarifications/apply`)).data
export const getCardReviews = async (id: string) =>
  (await host.get<CardReview[]>(`${cardPath(id)}/reviews`)).data
export const reviewCard = async (id: string) =>
  (await host.post<CardReview>(`${cardPath(id)}/reviews`)).data
export const getCardTags = async (signal?: AbortSignal) =>
  (await host.get<MarketplaceTag[]>('tags', { signal })).data
export const transcribeCardAudio = async (
  audio: Blob,
  signal?: AbortSignal
) => {
  const form = new FormData()
  const extension = audio.type.includes('mp4')
    ? 'mp4'
    : audio.type.includes('ogg')
      ? 'ogg'
      : 'webm'
  form.set('audio', audio, `speech.${extension}`)
  return (
    await host.post<{ text: string }>('cards/transcribe', form, { signal })
  ).data.text
}
export const getCardCompany = async (signal?: AbortSignal) => {
  try {
    return (
      await host.get<{ company: { id: string; name: string } }>(
        'companies/me',
        { signal }
      )
    ).data.company
  } catch (error) {
    if (
      isAxiosError<{ message: string }>(error) &&
      error.response?.status === 404 &&
      error.response.data.message === 'company_not_found'
    ) {
      return null
    }
    throw error
  }
}
export const createCardCompany = async (name: string) =>
  (await host.post<{ id: string; name: string }>('companies', { name })).data
