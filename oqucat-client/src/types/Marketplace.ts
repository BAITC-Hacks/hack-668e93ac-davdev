export interface MarketplaceCompany {
  id: string
  name: string
  logo: string | null
}

export interface MarketplaceTag {
  id: string
  name: string
  logo: string | null
}

export interface ProjectCard {
  id: string
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
  reward_points: number
  published_at: string | null
}

export interface ProjectCardField {
  id: string
  key: string
  label: string
  value: unknown
}

export interface ProjectCardDetails {
  card: ProjectCard
  company: MarketplaceCompany | null
  fields: ProjectCardField[]
  tags: MarketplaceTag[]
}

export interface ProjectCardCatalog {
  cards: ProjectCardDetails[]
  page: number
  limit: number
  total: number
  pages: number
}

export interface MarketplaceUser {
  id: string
  name: string
  image: string | null
}

export interface Team {
  id: string
  captain_id: string
  name: string
  logo: string | null
  points_balance: number
}

export type TeamMemberStatus = 'pending' | 'accepted' | 'declined'

export interface TeamMembership {
  team_id: string
  user_id: string
  status: TeamMemberStatus
  joined_at: string | null
  team: Team
  user?: MarketplaceUser
}

export interface TeamDetails {
  team: Team
  captain: MarketplaceUser | null
  members: {
    membership: TeamMembership
  }[]
  rating: number | null
  reviews_count: number
}

export interface MyTeams {
  memberships: TeamMembership[]
  details: TeamDetails[]
}

export type ApplicationStatus =
  | 'pending'
  | 'interested'
  | 'accepted'
  | 'rejected'
  | 'withdrawn'
  | 'completed'

export interface ProjectApplication {
  id: string
  status: ApplicationStatus
  submitted_at: string
  materials: {
    idea: string
    plan: string
    prototype_url: string
  }
}

export interface ApplicationDetails {
  application: ProjectApplication
  card: ProjectCard | null
  team: Team | null
}

export interface StudentLeaderboardEntry {
  rank: number
  student: {
    user_id: string
    points_balance: number
    user: MarketplaceUser
  }
  rating: number | null
}

export interface TeamLeaderboardEntry {
  rank: number
  team: Team & { captain: MarketplaceUser }
  rating: number | null
}
