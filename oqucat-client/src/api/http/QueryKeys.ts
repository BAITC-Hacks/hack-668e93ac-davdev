export const queryKeys = {
  notificationUsers: ['notificationUsers'],
  chats: ['chats'],
  messages: (chatUserId: string) => ['messages', chatUserId],
} as const
