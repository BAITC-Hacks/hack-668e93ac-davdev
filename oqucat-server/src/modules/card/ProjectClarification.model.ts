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

import { ProjectCard } from './ProjectCard.model'

export interface ProjectClarificationCreationAttributes {
  card_id: string
  question: string
  answer?: string | null
  sequence: number
  completeness_score?: number
}

@Table({
  tableName: 'project_clarification',
  modelName: 'project_clarification',
  timestamps: true,
  indexes: [
    {
      name: 'project_clarification_card_sequence_unique',
      unique: true,
      fields: ['card_id', 'sequence'],
    },
  ],
})
export class ProjectClarification extends Model<
  ProjectClarification,
  ProjectClarificationCreationAttributes
> {
  @PrimaryKey
  @Default(uuidv7)
  @Column(DataType.UUID)
  declare id: string

  @Index
  @ForeignKey(() => ProjectCard)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare card_id: string

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare question: string

  @Column(DataType.TEXT)
  declare answer: string | null

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare sequence: number

  @AllowNull(false)
  @Default(0)
  @Column(DataType.SMALLINT)
  declare completeness_score: number

  @BelongsTo(() => ProjectCard, 'card_id')
  declare card: ProjectCard
}
