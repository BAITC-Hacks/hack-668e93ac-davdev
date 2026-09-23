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

import { CardCreationMethod } from '../../types/CardCreationMethod'
import { CardStatus } from '../../types/CardStatus'
import { Company } from '../company/Company.model'

export interface ProjectCardCreationAttributes {
  company_id: string
  title: string
  context?: string | null
  need?: string | null
  target_users?: string | null
  data?: string | null
  constraints?: string | null
  expected_result?: string | null
  success_criteria?: string | null
  contact?: string | null
  interaction_format?: string | null
  creation_method?: CardCreationMethod
  status?: CardStatus
  completeness_score?: number
  reward_points?: number
  published_at?: Date | null
  completed_at?: Date | null
}

@Table({
  tableName: 'project_card',
  modelName: 'project_card',
  timestamps: true,
  indexes: [
    {
      name: 'project_card_company_status_idx',
      fields: ['company_id', 'status'],
    },
  ],
})
export class ProjectCard extends Model<
  ProjectCard,
  ProjectCardCreationAttributes
> {
  @PrimaryKey
  @Default(uuidv7)
  @Column(DataType.UUID)
  declare id: string

  @Index
  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare company_id: string

  @AllowNull(false)
  @Column(DataType.STRING)
  declare title: string

  @Column(DataType.TEXT)
  declare context: string | null

  @Column(DataType.TEXT)
  declare need: string | null

  @Column(DataType.TEXT)
  declare target_users: string | null

  @Column(DataType.TEXT)
  declare data: string | null

  @Column(DataType.TEXT)
  declare constraints: string | null

  @Column(DataType.TEXT)
  declare expected_result: string | null

  @Column(DataType.TEXT)
  declare success_criteria: string | null

  @Column(DataType.TEXT)
  declare contact: string | null

  @Column(DataType.TEXT)
  declare interaction_format: string | null

  @AllowNull(false)
  @Default(CardCreationMethod.MANUAL)
  @Column(DataType.STRING)
  declare creation_method: CardCreationMethod

  @AllowNull(false)
  @Default(CardStatus.DRAFT)
  @Column(DataType.STRING)
  declare status: CardStatus

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.SMALLINT,
    comment: 'Highest completeness score from all AI reviews of this card',
    validate: { min: 0, max: 100 },
  })
  declare completeness_score: number

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Reward calculated from the AI-evaluated project difficulty',
    validate: { min: 0 },
  })
  declare reward_points: number

  @Column(DataType.DATE)
  declare published_at: Date | null

  @Column(DataType.DATE)
  declare completed_at: Date | null

  @BelongsTo(() => Company, 'company_id')
  declare company: Company
}
