import type { MarketplaceTag } from './Marketplace'

export type CardStatus =
  | 'draft'
  | 'published'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

export interface ProjectCard {
  id: string
  company_id: string
  title: string
  context: string | null
  need: string | null
  target_users: string | null
  data: string | null
  constraints: string | null
  expected_result: string | null
  success_criteria: string | null
  contact: string | null
  interaction_format: string | null
  status: CardStatus
  completeness_score: number
  reward_points: number
  published_at: string | null
  creation_method: 'manual' | 'text_chat' | 'voice_assistant'
}

export interface CardDetails {
  card: ProjectCard
  company: {
    id: string
    name: string
    description: string | null
    logo: string | null
    website: string | null
  } | null
  fields: {
    id: string
    key: string
    label: string
    value: JsonValue
    field_type: CardFieldType
    position: number
  }[]
  tags: MarketplaceTag[]
}

export type CardFieldType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'url'
  | 'json'
export type CardTextKey =
  | 'title'
  | 'context'
  | 'need'
  | 'target_users'
  | 'data'
  | 'constraints'
  | 'expected_result'
  | 'success_criteria'
  | 'contact'
  | 'interaction_format'
export interface CardInput extends Record<CardTextKey, string | null> {
  title: string
  creation_method?: ProjectCard['creation_method']
  fields: Omit<CardDetails['fields'][number], 'id'>[]
  tag_ids: string[]
}
export interface CardClarification {
  id: string
  question: string
  answer: string | null
  sequence: number
}
export interface CardReview {
  id: string
  is_current?: boolean
  reviewed_at: string | null
  rating: Record<
    string,
    {
      name: string
      points: number
      max_points: number
      expected: string
      got: string
    }
  > | null
}

export interface CardFilters {
  page: number
  limit: number
  search: string
  sort: 'completeness' | 'newest'
}

export interface CardCatalog {
  cards: CardDetails[]
  page: number
  limit: number
  total: number
  pages: number
}
