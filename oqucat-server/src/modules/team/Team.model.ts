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

import type { UserID } from '../../types/UserId'
import { User } from '../user/User.model'

export interface TeamCreationAttributes {
  captain_id: UserID
  name: string
  logo?: string | null
  points_balance?: number
}

@Table({ tableName: 'team', modelName: 'team', timestamps: true })
export class Team extends Model<Team, TeamCreationAttributes> {
  @PrimaryKey
  @Default(uuidv7)
  @Column(DataType.UUID)
  declare id: string

  @Index
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare captain_id: UserID

  @AllowNull(false)
  @Column(DataType.STRING)
  declare name: string

  @Column(DataType.STRING)
  declare logo: string | null

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Cached balance derived from the team point history ledger',
  })
  declare points_balance: number

  @BelongsTo(() => User, 'captain_id')
  declare captain: User
}
