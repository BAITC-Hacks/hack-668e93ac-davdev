import { logger } from 'better-auth'
import nodemailer, { type SentMessageInfo } from 'nodemailer'

import cfg from '@/config'

const transport = nodemailer.createTransport({
  host: 'localhost',
  port: 25,
  secure: false,
  tls: {
    rejectUnauthorized: false,
  },
})

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<boolean> => {
  try {
    await transport.sendMail({
      from: `"${cfg.APP_NAME}" <noreply@dav-dev.kz>`,
      to,
      subject,
      text: html,
      html,
    })
    return true
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error))
    return false
  }
}

export const sendEmailAtt = async (
  to: string,
  subject: string,
  html: string,
  att: Uint8Array,
  filename: string
): Promise<SentMessageInfo> => {
  const res = await transport.sendMail({
    from: `"${cfg.APP_NAME}" <noreply@dav-dev.kz>`,
    to,
    subject,
    text: html,
    html,
    attachments: [
      {
        filename,
        content: Buffer.from(att),
      },
    ],
  })
  return res
}
