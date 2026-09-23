import { isDev } from '@/config'

const logger = {
  debug: (...args: unknown[]) => {
    if (isDev) {
      console.debug(...args)
    }
  },
  info: (...args: unknown[]) => {
    if (isDev) {
      console.info(...args)
    }
  },
  warn: (...args: unknown[]) => {
    if (isDev) {
      console.warn(...args)
    }
  },
  error: (...args: unknown[]) => {
    if (isDev) {
      console.error(...args)
    }
  },
}

export default logger
