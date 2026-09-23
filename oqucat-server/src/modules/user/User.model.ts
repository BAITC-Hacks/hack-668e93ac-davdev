import {
  AllowNull,
  Column,
  DataType,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript'
import { uuidv7 } from 'uuidv7'

import type { Language } from '../../types/Languages'
import type { UserID } from '../../types/UserId'
import { UserRole } from '../../types/UserRole'
import { Account } from '../auth/Account.model'
import { Passkey } from '../auth/Passkey.model'
import { Session } from '../auth/Session.model'
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
  @Default(UserRole.USER)
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
}
