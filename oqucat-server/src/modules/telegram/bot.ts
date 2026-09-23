import { Bot } from 'grammy'
import i18next from 'i18next'

import cfg from '../../config'
import { logger } from '../../logger'
import { User } from '../user/User.model'

const bot = new Bot(cfg.TG_KEY)

// const escapeMDV2 = (text: string) =>
//   text.replaceAll(/[_*[\]()~`>#+\-=|{}.!]/gu, String.raw`\$&`)

bot.command('start', async (ctx) => {
  const ch = ctx.chat
  if (ch.type !== 'private') {
    return null
  }

  const telegramId = String(ctx.from?.id)

  const existingUser = await User.findOne({
    where: { telegramId },
  })

  const lng = ctx.from?.language_code?.split('-')[0] ?? 'en'

  const t = i18next.getFixedT(lng)

  if (existingUser) {
    return ctx.reply(t('telegram.alreadyLinked'))
  }

  return ctx.reply('Hello from OquCat!')
})

process.once('SIGINT', () => {
  void bot.stop()
})
process.once('SIGTERM', () => {
  void bot.stop()
})

// Grammy requires an error-handler callback here.
// oxlint-disable-next-line unicorn/prefer-top-level-await, promise/prefer-await-to-callbacks
bot.catch((error) => {
  logger.error(error, 'Bot error')
  const lng = error.ctx.from?.language_code?.split('-')[0] ?? 'en'

  const t = i18next.getFixedT(lng)
  void error.ctx.reply(t('telegram.unexpectedError'))
})

export default bot
