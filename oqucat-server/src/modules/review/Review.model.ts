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
import { ProjectApplication } from '../application/ProjectApplication.model'
import { Company } from '../company/Company.model'
import { Team } from '../team/Team.model'
import { User } from '../user/User.model'

export interface ReviewCreationAttributes {
  company_id: string
  application_id: string
  team_id: string
  student_id: UserID
  rating: number
  comment?: string | null
}

@Table({
  tableName: 'review',
  modelName: 'review',
  timestamps: true,
  indexes: [
    {
      name: 'review_application_student_unique',
      unique: true,
      fields: ['application_id', 'student_id'],
    },
  ],
})
export class Review extends Model<Review, ReviewCreationAttributes> {
  @PrimaryKey
  @Default(uuidv7)
  @Column(DataType.UUID)
  declare id: string

  @Index
  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare company_id: string

  @Index
  @ForeignKey(() => ProjectApplication)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare application_id: string

  @Index
  @ForeignKey(() => Team)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare team_id: string

  @Index
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare student_id: UserID

  @AllowNull(false)
  @Column({
    type: DataType.SMALLINT,
    validate: { min: 1, max: 5 },
  })
  declare rating: number

  @Column(DataType.TEXT)
  declare comment: string | null

  @BelongsTo(() => Company, 'company_id')
  declare company: Company

  @BelongsTo(() => ProjectApplication, 'application_id')
  declare application: ProjectApplication

  @BelongsTo(() => Team, 'team_id')
  declare team: Team

  @BelongsTo(() => User, 'student_id')
  declare student: User
}
