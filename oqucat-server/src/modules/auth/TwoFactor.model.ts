import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Index,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript'
import { uuidv7 } from 'uuidv7'

import type { UserID } from '@/types/UserId'

import { User } from '../user/User.model'

interface TwoFactorCreationAttributes {
  userId: UserID
  secret: string
  backupCodes: string
  verified?: boolean
  failedVerificationCount?: number
  lockedUntil?: Date | null
}

@Table({
  tableName: 'twoFactor',
  modelName: 'twoFactor',
  timestamps: false,
})
export class TwoFactor extends Model<TwoFactor, TwoFactorCreationAttributes> {
  @PrimaryKey
  @Default(uuidv7)
  @Column(DataType.UUID)
  declare id: UserID

  @ForeignKey(() => User)
  @AllowNull(false)
  @Unique
  @Index
  @Column(DataType.UUID)
  declare userId: UserID

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare secret: string

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare backupCodes: string

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  declare verified: boolean

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare failedVerificationCount: number

  @Column(DataType.DATE)
  declare lockedUntil: Date | null

  @BelongsTo(() => User)
  declare user: User
}
