import type { CardCatalog, CardDetails, CardFilters } from '@/types/ProjectCard'

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
