import type { TeamUser } from './Team'

export interface StudentProfile {
  user_id: string
  points_balance: number
  portfolio: string | null
  website: string | null
  user?: TeamUser | null
}

export interface StudentDetails {
  profile: StudentProfile
  user: TeamUser
  rating: number | null
  reviews_count: number
}
