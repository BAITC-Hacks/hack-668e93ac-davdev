import pino from 'pino'

import cfg from './config'

export const logger = pino({
  level: cfg.LOG_LEVEL,

  redact: {
    paths: [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'authorization',
      'headers.authorization',
      'req.headers.authorization',
      'req.headers.cookie',
    ],
    censor: '[REDACTED]',
  },

  base: {
    service: cfg.APP_NAME,
  },
})
