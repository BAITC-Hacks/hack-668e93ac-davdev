export const queryKeys = {
  notificationUsers: ['notificationUsers'],
  chats: ['chats'],
  messages: (chatUserId: string) => ['messages', chatUserId],
  projectCards: (tagId: string) => ['projectCards', tagId],
  marketplaceTags: ['marketplaceTags'],
  myTeamMemberships: ['myTeamMemberships'],
  myApplications: ['myApplications'],
  leaderboard: (kind: 'students' | 'teams') => ['leaderboard', kind],
} as const
