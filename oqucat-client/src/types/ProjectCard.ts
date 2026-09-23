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
    label: string
    value: JsonValue
    field_type: string
    position: number
  }[]
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
