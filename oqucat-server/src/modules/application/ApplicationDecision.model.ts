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

import type { ApplicationDecisionStatus } from '../../types/ApplicationDecisionStatus'
import type { UserID } from '../../types/UserId'
import { User } from '../user/User.model'
import { ProjectApplication } from './ProjectApplication.model'

export interface ApplicationDecisionCreationAttributes {
  application_id: string
  decided_by: UserID
  status: ApplicationDecisionStatus
  comment?: string | null
  decided_at?: Date
}

@Table({
  tableName: 'application_decision',
  modelName: 'application_decision',
  timestamps: true,
  indexes: [
    {
      name: 'application_decision_application_unique',
      unique: true,
      fields: ['application_id'],
    },
  ],
})
export class ApplicationDecision extends Model<
  ApplicationDecision,
  ApplicationDecisionCreationAttributes
> {
  @PrimaryKey
  @Default(uuidv7)
  @Column(DataType.UUID)
  declare id: string

  @Index
  @ForeignKey(() => ProjectApplication)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare application_id: string

  @Index
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare decided_by: UserID

  @AllowNull(false)
  @Column(DataType.STRING)
  declare status: ApplicationDecisionStatus

  @Column(DataType.TEXT)
  declare comment: string | null

  @AllowNull(false)
  @Default(DataType.NOW)
  @Column(DataType.DATE)
  declare decided_at: Date

  @BelongsTo(() => ProjectApplication, 'application_id')
  declare application: ProjectApplication

  @BelongsTo(() => User, 'decided_by')
  declare decision_maker: User
}
