import { baseURL } from '@/config'

export const defaultUserAvatar = '/user-icon.png'
export const defaultGroupAvatar = '/group-icon.png'

export const getAvatar = (image: string | undefined | null, v?: number) => {
  if (!image) {
    return defaultUserAvatar
  }
  if (image.startsWith('http')) {
    return image
  }
  return `${baseURL}avatars/${image}${v ? `?v=${v}` : ''}`
}

export const getLogo = (image: string | undefined, v?: number) =>
  image ? `${baseURL}logos/${image}${v ? `?v=${v}` : ''}` : '/icon-app.png'

export const getDeviceImg = (image: string | undefined, v?: number) =>
  image
    ? `${baseURL}deviceimgs/${image}${v ? `?v=${v}` : ''}`
    : '/device-icon.png'
