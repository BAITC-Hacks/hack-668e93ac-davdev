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
} from 'sequelize-typescript'

import { User } from '../user/User.model'

export interface MessageCreationAttributes {
  from_id: string
  to_id: string
  content: string
  read?: boolean
}

@Table({
  tableName: 'message',
  modelName: 'message',
  updatedAt: false,
})
export class Message extends Model<Message, MessageCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number

  @Index
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare from_id: string

  @Index
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare to_id: string

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare content: string

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare read: boolean

  @BelongsTo(() => User, 'from_id')
  declare from: User

  @BelongsTo(() => User, 'to_id')
  declare to: User
}
