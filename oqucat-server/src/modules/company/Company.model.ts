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

import type { UserID } from '../../types/UserId'
import { User } from '../user/User.model'

export interface CompanyCreationAttributes {
  owner_id: UserID
  name: string
  description?: string | null
  logo?: string | null
  website?: string | null
}

@Table({
  tableName: 'company',
  modelName: 'company',
  timestamps: true,
})
export class Company extends Model<Company, CompanyCreationAttributes> {
  @PrimaryKey
  @Default(uuidv7)
  @Column(DataType.UUID)
  declare id: string

  @Unique
  @Index
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare owner_id: UserID

  @AllowNull(false)
  @Column(DataType.STRING)
  declare name: string

  @Column(DataType.TEXT)
  declare description: string | null

  @Column(DataType.STRING)
  declare logo: string | null

  @Column(DataType.STRING)
  declare website: string | null

  @BelongsTo(() => User, 'owner_id')
  declare owner: User
}
