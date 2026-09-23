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
} from 'sequelize-typescript'
import { uuidv7 } from 'uuidv7'

import type { UserID } from '@/types/UserId'

import { User } from '../user/User.model'

interface PasskeyCreationAttributes {
  name?: string
  publicKey: string
  userId: UserID
  credentialID: string
  counter: number
  deviceType: string
  backedUp: boolean
  transports?: string
  createdAt?: Date
  aaguid?: string
}

@Table({
  tableName: 'passkey',
  modelName: 'passkey',
  timestamps: false,
  indexes: [
    {
      name: 'passkey_credential_id_idx',
      fields: ['credentialID'],
    },
  ],
})
export class Passkey extends Model<Passkey, PasskeyCreationAttributes> {
  @PrimaryKey
  @Default(uuidv7)
  @Column(DataType.UUID)
  declare id: UserID

  @Column(DataType.STRING)
  declare name: string | null

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare publicKey: string

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column(DataType.UUID)
  declare userId: UserID

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare credentialID: string

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare counter: number

  @AllowNull(false)
  @Column(DataType.STRING)
  declare deviceType: string

  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  declare backedUp: boolean

  @Column(DataType.TEXT)
  declare transports: string | null

  @Column(DataType.DATE)
  declare createdAt: Date | null

  @Column(DataType.STRING)
  declare aaguid: string | null

  @BelongsTo(() => User)
  declare user: User
}
