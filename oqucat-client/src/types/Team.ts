export interface TeamUser {
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

export interface TeamMember {
  id: number
  team_id: string
  user_id: string
  status: 'pending' | 'accepted' | 'declined'
  joined_at: string | null
  user?: TeamUser | null
}

export interface MyMembership extends TeamMember {
  team: Team | null
}

export interface TeamDetails {
  team: Team
  captain: TeamUser | null
  members: { membership: TeamMember }[]
  rating: number | null
  reviews_count: number
}

export interface TeamInput {
  name: string
  logo: string | null
}
