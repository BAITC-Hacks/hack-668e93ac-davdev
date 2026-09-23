import { logger } from '@/logger'
import { User } from '@/modules/user/User.model'

import { saveAvatar } from './saveAvatar'

export const replaceExternalAvatar = async (
  userId: string,
  image: string | null | undefined
) => {
  if (!image) {
    return
  }

  // Don't try to download our own filename.
  if (!image.startsWith('http://') && !image.startsWith('https://')) {
    return
  }

  try {
    const response = await fetch(image)

    if (!response.ok) {
      throw new Error(
        `Failed to fetch avatar: ${response.status} ${response.statusText}`
      )
    }

    const contentType = response.headers.get('content-type')

    if (!contentType?.startsWith('image/')) {
      throw new Error(
        `Avatar URL returned non-image content-type: ${contentType}`
      )
    }

    const input = Buffer.from(await response.arrayBuffer())
    const user = await User.findByPk(userId)

    if (!user) {
      return
    }

    await saveAvatar(user, input)
  } catch (error) {
    logger.error(
      {
        userId,
        image,
        error,
      },
      'Failed to mirror user avatar'
    )
  }
}
