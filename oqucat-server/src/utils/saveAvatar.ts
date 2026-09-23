import fs from 'node:fs/promises'
import path from 'node:path'

import sharp from 'sharp'

import cfg from '@/config'
import type { User } from '@/modules/user/User.model'

export const saveAvatar = async (user: User, input: Buffer) => {
  const avatarsDir = path.join(cfg.DATA_DIR, 'avatars')
  await fs.mkdir(avatarsDir, { recursive: true })

  const currentFileName = path.basename(user.image ?? '')
  const numberMatch = /-(?<number>\d+)\.webp$/u.exec(currentFileName)
  const currentNumber = Number(numberMatch?.groups?.number ?? 1)
  const nextNumber = currentNumber >= 9 ? 1 : currentNumber + 1
  const fileName = `${user.id}-${nextNumber}.webp`
  const filePath = path.join(avatarsDir, fileName)
  const oldFilePath =
    currentFileName === user.image &&
    (currentFileName === `${user.id}.webp` ||
      (currentFileName.startsWith(`${user.id}-`) &&
        currentFileName.endsWith('.webp')))
      ? path.join(avatarsDir, currentFileName)
      : null
  const previousImage = user.image

  const webpBuffer = await sharp(input)
    .resize(256, 256, {
      fit: 'cover',
      position: 'center',
    })
    .webp({ quality: 85 })
    .toBuffer()

  try {
    await fs.writeFile(filePath, webpBuffer)

    user.image = fileName
    await user.save()
  } catch (error) {
    user.image = previousImage
    await fs.rm(filePath, { force: true })
    throw error
  }

  if (oldFilePath && oldFilePath !== filePath) {
    await fs.rm(oldFilePath, { force: true })
  }

  return fileName
}
