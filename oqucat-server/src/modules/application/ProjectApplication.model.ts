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

import { ApplicationStatus } from '../../types/ApplicationStatus'
import type { ProjectApplicationMaterials } from '../../types/ProjectApplicationMaterials'
import type { UserID } from '../../types/UserId'
import { ProjectCard } from '../card/ProjectCard.model'
import { Team } from '../team/Team.model'
import { User } from '../user/User.model'

export interface ProjectApplicationCreationAttributes {
  team_id: string
  card_id: string
  submitted_by: UserID
  materials: ProjectApplicationMaterials
  status?: ApplicationStatus
  submitted_at?: Date
}

@Table({
  tableName: 'project_application',
  modelName: 'project_application',
  timestamps: true,
  indexes: [
    {
      name: 'project_application_team_card_unique',
      unique: true,
      fields: ['team_id', 'card_id'],
    },
    {
      name: 'project_application_card_status_idx',
      fields: ['card_id', 'status'],
    },
  ],
})
export class ProjectApplication extends Model<
  ProjectApplication,
  ProjectApplicationCreationAttributes
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
  @ForeignKey(() => ProjectCard)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare card_id: string

  @Index
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare submitted_by: UserID

  @AllowNull(false)
  @Column(DataType.JSONB)
  declare materials: ProjectApplicationMaterials

  @AllowNull(false)
  @Default(ApplicationStatus.PENDING)
  @Column(DataType.STRING)
  declare status: ApplicationStatus

  @AllowNull(false)
  @Default(DataType.NOW)
  @Column(DataType.DATE)
  declare submitted_at: Date

  @BelongsTo(() => Team, 'team_id')
  declare team: Team

  @BelongsTo(() => ProjectCard, 'card_id')
  declare card: ProjectCard

  @BelongsTo(() => User, 'submitted_by')
  declare submitter: User
}
