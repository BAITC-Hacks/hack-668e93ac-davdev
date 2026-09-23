import type { UserForNotif } from '@/types/UserForNotif'
import type { UserId } from '@/types/UserId'

import { apiRequest, type ApiSuccessResponse, host } from '.'

export const pushSuperadminNotification = (
  user_id: UserId,
  title: string,
  body: string
) =>
  apiRequest(
    host.post<ApiSuccessResponse>(`notification/push`, {
      user_id,
      title,
      body,
    }),
    { success: 'common:api.success.notificationSent' }
  )

export const getUsersForNotif = () =>
  apiRequest(host.get<UserForNotif[]>(`notification/users`))
