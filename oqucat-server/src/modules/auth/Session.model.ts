import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript'

import type { UserID } from '@/types/UserId'

import { User } from '../user/User.model'

interface SessionCreationAttributes {
  userId: UserID
  token: string
  expiresAt: Date
  ipAddress?: string
  userAgent?: string
}

@Table({
  tableName: 'session',
  modelName: 'session',
  timestamps: true,
})
export class Session extends Model<Session, SessionCreationAttributes> {
  @PrimaryKey
  @Column(DataType.UUID)
  declare id: UserID

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column(DataType.UUID)
  declare userId: UserID

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  declare token: string

  @AllowNull(false)
  @Column(DataType.DATE)
  declare expiresAt: Date

  @Column(DataType.STRING)
  declare ipAddress: string | null

  @Column(DataType.TEXT)
  declare userAgent: string | null

  @BelongsTo(() => User)
  declare user: User
}
