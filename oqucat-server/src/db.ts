import { Sequelize } from 'sequelize-typescript'

import cfg from './config'
import { ApplicationDecision } from './modules/application/ApplicationDecision.model'
import { ProjectApplication } from './modules/application/ProjectApplication.model'
import { Account } from './modules/auth/Account.model'
import { Passkey } from './modules/auth/Passkey.model'
import { Session } from './modules/auth/Session.model'
import { TwoFactor } from './modules/auth/TwoFactor.model'
import { Verification } from './modules/auth/Verification.model'
import { ProjectCard } from './modules/card/ProjectCard.model'
import { ProjectCardField } from './modules/card/ProjectCardField.model'
import { ProjectCardReview } from './modules/card/ProjectCardReview.model'
import { ProjectCardTag } from './modules/card/ProjectCardTag.model'
import { ProjectClarification } from './modules/card/ProjectClarification.model'
import { Message } from './modules/chat/Message.model'
import { Company } from './modules/company/Company.model'
import { StudentPointHistory } from './modules/points/StudentPointHistory.model'
import { TeamPointHistory } from './modules/points/TeamPointHistory.model'
import { Review } from './modules/review/Review.model'
import { StudentProfile } from './modules/student/StudentProfile.model'
import { StudentTag } from './modules/student/StudentTag.model'
import { Tag } from './modules/tag/Tag.model'
import { Team } from './modules/team/Team.model'
import { TeamMember } from './modules/team/TeamMember.model'
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
  Company,
  StudentProfile,
  Tag,
  StudentTag,
  Team,
  TeamMember,
  ProjectCard,
  ProjectCardField,
  ProjectCardReview,
  ProjectClarification,
  ProjectCardTag,
  ProjectApplication,
  ApplicationDecision,
  Review,
  StudentPointHistory,
  TeamPointHistory,
])

export { ensureDatabase }
export default sequelize
