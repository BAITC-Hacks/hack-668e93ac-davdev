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
} from 'sequelize-typescript'

import type { UserID } from '@/types/UserId'

import { User } from '../user/User.model'

interface AccountCreationAttributes {
  userId: UserID
  accountId: string
  providerId: string
  password?: string
  accessToken?: string
  refreshToken?: string
  accessTokenExpiresAt?: Date
  refreshTokenExpiresAt?: Date
  scope?: string
  idToken?: string
}

@Table({
  tableName: 'account',
  modelName: 'account',
  timestamps: true,
  indexes: [
    {
      name: 'account_provider_account_unique',
      unique: true,
      fields: ['providerId', 'accountId'],
    },
  ],
})
export class Account extends Model<Account, AccountCreationAttributes> {
  @PrimaryKey
  @Column(DataType.UUID)
  declare id: UserID

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column(DataType.UUID)
  declare userId: UserID

  @AllowNull(false)
  @Column(DataType.STRING)
  declare accountId: string

  @AllowNull(false)
  @Column(DataType.STRING)
  declare providerId: string

  @Column(DataType.TEXT)
  declare password: string | null

  @Column(DataType.TEXT)
  declare accessToken: string | null

  @Column(DataType.TEXT)
  declare refreshToken: string | null

  @Column(DataType.DATE)
  declare accessTokenExpiresAt: Date | null

  @Column(DataType.DATE)
  declare refreshTokenExpiresAt: Date | null

  @Column(DataType.TEXT)
  declare scope: string | null

  @Column(DataType.TEXT)
  declare idToken: string | null

  @BelongsTo(() => User)
  declare user: User
}
