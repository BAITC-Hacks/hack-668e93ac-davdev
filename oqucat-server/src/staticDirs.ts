import fs from 'node:fs/promises'
import path from 'node:path'

import express, { type Application } from 'express'

import cfg from './config'

export const staticDirs = {
  avatars: path.join(cfg.DATA_DIR, 'avatars'),
} as const

export const staticRoutes = {
  '/api/avatars': staticDirs.avatars,
} as const

export const setupStaticDirs = async (app: Application) => {
  await Promise.all(
    Object.values(staticDirs).map((dir) => fs.mkdir(dir, { recursive: true }))
  )

  for (const [route, directory] of Object.entries(staticRoutes)) {
    app.use(route, express.static(directory))
  }
}
