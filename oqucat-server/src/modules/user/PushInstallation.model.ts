import {
  AllowNull,
  AutoIncrement,
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

import type { UserID } from '@/types/UserId'

import type { IdentifierType } from '../../types/IdentifierType'
import type { Platform } from '../../types/Platform'
import { User } from '../user/User.model'

interface PushInstallationCreationAttributes {
  user_id: UserID
  token: string
  platform: Platform
  identifierType: IdentifierType
  user_agent?: string
}

@Table({
  tableName: 'push_installations',
  modelName: 'push_installations',
})
export class PushInstallation extends Model<
  PushInstallation,
  PushInstallationCreationAttributes
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column(DataType.UUID)
  declare user_id: UserID

  @Unique
  @AllowNull(false)
  @Column(DataType.TEXT)
  declare token: string

  @AllowNull(false)
  @Default('web')
  @Column(DataType.STRING)
  declare platform: Platform

  @AllowNull(false)
  @Default('fid')
  @Column(DataType.STRING)
  declare identifierType: IdentifierType

  @Column(DataType.TEXT)
  declare user_agent: string | null

  @BelongsTo(() => User)
  declare user: User
}
