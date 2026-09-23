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
import type { UserID } from '../../types/UserId'
import { ProjectApplication } from '../application/ProjectApplication.model'
import { User } from '../user/User.model'

export interface StudentPointHistoryCreationAttributes {
  student_id: UserID
  application_id?: string | null
  amount: number
  balance_after: number
  reason: PointTransactionReason
  description?: string | null
}

@Table({
  tableName: 'student_point_history',
  modelName: 'student_point_history',
  timestamps: true,
})
export class StudentPointHistory extends Model<
  StudentPointHistory,
  StudentPointHistoryCreationAttributes
> {
  @PrimaryKey
  @Default(uuidv7)
  @Column(DataType.UUID)
  declare id: string

  @Index
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare student_id: UserID

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
    comment: 'Cached student balance immediately after this ledger entry',
  })
  declare balance_after: number

  @AllowNull(false)
  @Column(DataType.STRING)
  declare reason: PointTransactionReason

  @Column(DataType.TEXT)
  declare description: string | null

  @BelongsTo(() => User, 'student_id')
  declare student: User

  @BelongsTo(() => ProjectApplication, 'application_id')
  declare application: ProjectApplication | null
}
