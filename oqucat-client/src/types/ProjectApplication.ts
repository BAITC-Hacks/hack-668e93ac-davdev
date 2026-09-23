import type { ProjectCard } from './ProjectCard'
import type { Team } from './Team'

export type ApplicationStatus =
  | 'pending'
  | 'interested'
  | 'accepted'
  | 'rejected'
  | 'withdrawn'
  | 'completed'

export interface ApplicationMaterials {
  idea: string
  plan: string
  prototype_url: string
}

export interface ProjectApplication {
  id: string
  card_id: string
  team_id: string
  materials: ApplicationMaterials
  status: ApplicationStatus
  submitted_at: string
}

export interface ApplicationDetails {
  application: ProjectApplication
  card: ProjectCard | null
  team: Team | null
  decision: {
    status: 'interested' | 'accepted' | 'rejected'
    comment: string | null
    decided_at: string
  } | null
}

export interface ApplicationInput {
  card_id: string
  team_id: string
  materials: ApplicationMaterials
}
