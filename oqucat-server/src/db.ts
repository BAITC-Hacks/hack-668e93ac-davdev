import { Sequelize } from 'sequelize-typescript'

import cfg from './config'
import { Account } from './modules/auth/Account.model'
import { Passkey } from './modules/auth/Passkey.model'
import { Session } from './modules/auth/Session.model'
import { TwoFactor } from './modules/auth/TwoFactor.model'
import { Verification } from './modules/auth/Verification.model'
import { Message } from './modules/chat/Message.model'
import { PushInstallation } from './modules/user/PushInstallation.model'
import { User } from './modules/user/User.model'

const ensureDatabase = async () => {
  const adminSequelize = new Sequelize(
    'postgres',
    cfg.DB_USER,
    cfg.DB_PASSWORD,
    {
      host: cfg.DB_HOST,
      port: cfg.DB_PORT,
      dialect: 'postgres',
      logging: cfg.DEV,
    }
  )

  await adminSequelize.query(`CREATE DATABASE "${cfg.DB_NAME}";`).catch(() => {
    // the database may already exist
  })

  await adminSequelize.close()
}

const sequelize = new Sequelize(cfg.DB_NAME, cfg.DB_USER, cfg.DB_PASSWORD, {
  dialect: 'postgres',
  host: cfg.DB_HOST,
  port: cfg.DB_PORT,
  logging: cfg.DEV,
})

sequelize.addModels([
  User,
  Account,
  Passkey,
  Session,
  TwoFactor,
  Verification,
  Message,
  PushInstallation,
])

export { ensureDatabase }
export default sequelize
