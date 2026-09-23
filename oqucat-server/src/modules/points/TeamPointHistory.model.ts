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

import type { PointTransactionReason } from '../../types/PointTransactionReason'
import { ProjectApplication } from '../application/ProjectApplication.model'
import { Team } from '../team/Team.model'

export interface TeamPointHistoryCreationAttributes {
  team_id: string
  application_id?: string | null
  amount: number
  balance_after: number
  reason: PointTransactionReason
  description?: string | null
}

@Table({
  tableName: 'team_point_history',
  modelName: 'team_point_history',
  timestamps: true,
})
export class TeamPointHistory extends Model<
  TeamPointHistory,
  TeamPointHistoryCreationAttributes
> {
  @PrimaryKey
  @Default(uuidv7)
  @Column(DataType.UUID)
  declare id: string

  @Index
  @ForeignKey(() => Team)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare team_id: string

  @Index
  @ForeignKey(() => ProjectApplication)
  @Column(DataType.UUID)
  declare application_id: string | null

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare amount: number

  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    comment: 'Cached team balance immediately after this ledger entry',
  })
  declare balance_after: number

  @AllowNull(false)
  @Column(DataType.STRING)
  declare reason: PointTransactionReason

  @Column(DataType.TEXT)
  declare description: string | null

  @BelongsTo(() => Team, 'team_id')
  declare team: Team

  @BelongsTo(() => ProjectApplication, 'application_id')
  declare application: ProjectApplication | null
}
