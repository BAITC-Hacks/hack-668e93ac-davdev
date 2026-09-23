import type { StudentProfile } from './StudentProfile'
import type { Team } from './Team'

export interface StudentRank {
  rank: number
  student: StudentProfile
  rating: number | null
}

export interface TeamRank {
  rank: number
  team: Team
  rating: number | null
}
