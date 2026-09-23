import type { CardFilters } from '@/types/ProjectCard'

export const queryKeys = {
  marketplace: (userId: string | undefined) => ['marketplace', userId],
  cards: (userId: string | undefined, filters: CardFilters) => [
    'marketplace',
    userId,
    'cards',
    filters,
  ],
  card: (userId: string | undefined, id: string) => [
    'marketplace',
    userId,
    'card',
    id,
  ],
  myTeams: (userId: string | undefined) => ['marketplace', userId, 'teams'],
  team: (userId: string | undefined, id: string) => [
    'marketplace',
    userId,
    'team',
    id,
  ],
  myApplications: (userId: string | undefined) => [
    'marketplace',
    userId,
    'applications',
  ],
  studentProfile: (userId: string | undefined) => [
    'marketplace',
    userId,
    'student',
  ],
  leaderboard: (userId: string | undefined, kind: string) => [
    'marketplace',
    userId,
    'leaderboard',
    kind,
  ],
  notificationUsers: ['notificationUsers'],
  chats: ['chats'],
  messages: (chatUserId: string) => ['messages', chatUserId],
} as const
