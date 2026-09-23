import {
  AllowNull,
  Column,
  DataType,
  Default,
  HasMany,
  HasOne,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript'
import { uuidv7 } from 'uuidv7'

import type { Language } from '../../types/Languages'
import type { UserID } from '../../types/UserId'
import { UserRole } from '../../types/UserRole'
import { ApplicationDecision } from '../application/ApplicationDecision.model'
import { ProjectApplication } from '../application/ProjectApplication.model'
import { Account } from '../auth/Account.model'
import { Passkey } from '../auth/Passkey.model'
import { Session } from '../auth/Session.model'
import { TwoFactor } from '../auth/TwoFactor.model'
import { ProjectCardReview } from '../card/ProjectCardReview.model'
import { Message } from '../chat/Message.model'
import { Company } from '../company/Company.model'
import { StudentPointHistory } from '../points/StudentPointHistory.model'
import { Review } from '../review/Review.model'
import { StudentProfile } from '../student/StudentProfile.model'
import { Team } from '../team/Team.model'
import { TeamMember } from '../team/TeamMember.model'
import { PushInstallation } from './PushInstallation.model'

interface UserCreationAttributes {
  email: string
  name?: string | null
  image?: string | null
  emailVerified?: boolean
  role?: UserRole
  banned?: boolean
  banReason?: string | null
  banExpires?: Date | null
  company_id?: number | null
  locale?: Language
  tz?: string
}

@Table({
  tableName: 'user',
  modelName: 'user',
  timestamps: true,
})
export class User extends Model<User, UserCreationAttributes> {
  @PrimaryKey
  @Default(uuidv7)
  @Column(DataType.UUID)
  declare id: UserID

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  declare email: string

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare emailVerified: boolean

  @AllowNull(false)
  @Column(DataType.STRING)
  declare name: string

  @Column(DataType.STRING)
  declare image: string | null

  @AllowNull(false)
  @Default(UserRole.UNASSIGNED)
  @Column(DataType.STRING)
  declare role: UserRole

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare banned: boolean

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare twoFactorEnabled: boolean

  @Column(DataType.STRING)
  declare banReason: string | null

  @Column(DataType.DATE)
  declare banExpires: Date | null

  @AllowNull(false)
  @Default('en')
  @Column(DataType.STRING)
  declare locale: Language

  @AllowNull(false)
  @Default('Asia/Qyzylorda')
  @Column(DataType.STRING)
  declare tz: string

  @Column(DataType.STRING)
  declare telegramId: string | null

  @Column(DataType.STRING)
  declare telegramUsername: string | null

  @Column(DataType.STRING)
  declare telegramPhoneNumber: string | null

  @HasMany(() => PushInstallation)
  declare push_installations: PushInstallation[]

  @HasMany(() => Session)
  declare sessions: Session[]

  @HasMany(() => Account)
  declare accounts: Account[]

  @HasMany(() => Passkey)
  declare passkeys: Passkey[]

  @HasOne(() => TwoFactor, 'userId')
  declare two_factor: TwoFactor | null

  @HasOne(() => Company, 'owner_id')
  declare company: Company | null

  @HasOne(() => StudentProfile, 'user_id')
  declare student_profile: StudentProfile | null

  @HasMany(() => Team, 'captain_id')
  declare captained_teams: Team[]

  @HasMany(() => TeamMember, 'user_id')
  declare team_memberships: TeamMember[]

  @HasMany(() => TeamMember, 'invited_by')
  declare sent_team_invitations: TeamMember[]

  @HasMany(() => ProjectApplication, 'submitted_by')
  declare submitted_applications: ProjectApplication[]

  @HasMany(() => ApplicationDecision, 'decided_by')
  declare application_decisions: ApplicationDecision[]

  @HasMany(() => ProjectCardReview, 'requested_by')
  declare requested_card_reviews: ProjectCardReview[]

  @HasMany(() => Review, 'student_id')
  declare received_reviews: Review[]

  @HasMany(() => StudentPointHistory, 'student_id')
  declare point_history: StudentPointHistory[]

  @HasMany(() => Message, 'from_id')
  declare sent_messages: Message[]

  @HasMany(() => Message, 'to_id')
  declare received_messages: Message[]
}
