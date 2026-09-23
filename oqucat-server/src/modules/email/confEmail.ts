import { sendEmail } from '.'
import cfg from '../../config'
import type { Language } from '../../types/Languages'
import getT from '../../utils/getT'
import generateAdminRegEmail from './templates/adminRegEmail'
import generateConfirmEmail from './templates/confirmEmail'
import generateDoctorRegEmail from './templates/doctorRegEmail'
import generatePassResetEmail from './templates/passResetEmail'

export const sendConfirmationEmail = async (
  email: string,
  link: string,
  locale?: Language
) => {
  const t = getT(locale)
  await sendEmail(
    email,
    t('email.confirmation.subject'),
    generateConfirmEmail({
      link,
      client: cfg.CLIENT,
      t,
    })
  )
}

export const sendAdminRegEmail = async (
  email: string,
  company: string,
  password: string,
  locale?: Language
) => {
  const t = getT(locale)
  await sendEmail(
    email,
    t('email.adminRegistration.subject'),
    generateAdminRegEmail({
      client: cfg.CLIENT,
      company,
      email,
      password,
      t,
    })
  )
}

export const sendDoctorRegEmail = async (
  email: string,
  company: string,
  password: string,
  locale?: Language
) => {
  const t = getT(locale)
  await sendEmail(
    email,
    t('email.doctorRegistration.subject', { company }),
    generateDoctorRegEmail({
      client: cfg.CLIENT,
      company,
      email,
      password,
      t,
    })
  )
}

export const sendResetPasswordEmail = async (
  email: string,
  token: string,
  locale?: Language
) => {
  const t = getT(locale)

  const url = `${cfg.CLIENT}/reset-password?token=${token}`

  await sendEmail(
    email,
    t('email.passwordReset.subject'),
    generatePassResetEmail({
      client: cfg.CLIENT,
      email,
      url,
      t,
    })
  )
}
