import { apiRequest, host } from '.'

export const updateAvatar = (file: File) => {
  const formData = new FormData()
  formData.append('avatar', file)

  return apiRequest(
    host.patch<{ newImage: string }>('user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    { success: 'common:api.success.avatarUpdated' }
  )
}

export const setPassword = (newPassword: string) =>
  apiRequest(
    host.post<{ message?: string }>('user/set_password', { newPassword })
  )
