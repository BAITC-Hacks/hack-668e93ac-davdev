import http from 'node:http'

import { fromNodeHeaders, toNodeHandler } from 'better-auth/node'
import cors from 'cors'
import express from 'express'
import fileUpload from 'express-fileupload'
import { ipKeyGenerator, rateLimit } from 'express-rate-limit'
import helmet from 'helmet'

import cfg, { trustedOrigins } from './config'
import sequelize, { ensureDatabase } from './db'
import { initI18n } from './i18n'
import { logger } from './logger'
import { errorMiddleware } from './middleware/error'
import { auth } from './modules/auth/betterAuth'
import { startCronJobs } from './modules/notification/cron'
// import bot from './modules/telegram/bot'
import router from './router'
import seedDatabase from './seeding'
import { initSio } from './sio'
import { setupStaticDirs } from './staticDirs'

await initI18n()

// void bot.start()

const { PORT } = cfg
const app = express()
app.set('trust proxy', 'loopback')
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  })
)
app.use(cors({ origin: trustedOrigins, credentials: true }))
app.all('/api/auth/{*any}', toNodeHandler(auth))

app.use(express.json({ limit: '2mb' }))
app.use(fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } }))

app.use(async (req, _res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    })

    if (session?.user.id) {
      req.rateLimitUserId = session.user.id
    }
  } catch {
    // Anonymous requests remain rate limited by IP.
  }

  next()
})

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 150,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(
      req.ip ?? req.socket.remoteAddress ?? 'unknown',
      56
    )
    return req.rateLimitUserId ? `${ip}:${req.rateLimitUserId}` : ip
  },
})
app.use(limiter)

await setupStaticDirs(app)

app.use('/api/', router)
app.get('/api/', (req, res) => res.send({ msg: `check on port ${PORT}!` }))
app.use(errorMiddleware)

const server = http.createServer((req, res) => {
  app(req, res)
})
initSio(server)

const start = async () => {
  try {
    await ensureDatabase()
    await sequelize.authenticate()
    // await sequelize.sync({ alter: true })
    await sequelize.sync({ alter: cfg.DEV })
    await seedDatabase()
    startCronJobs()
    server.listen(PORT, () => {
      logger.info(`Server started on port ${PORT}`)
    })
  } catch (error) {
    logger.error(error)
  }
}

await start()
