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

import { DynamicFieldType } from '@/types/DynamicFieldType'
import type { JsonValue } from '@/types/JsonValue'

import { ProjectCard } from './ProjectCard.model'

export interface ProjectCardFieldCreationAttributes {
  card_id: string
  key: string
  label: string
  value?: JsonValue
  field_type?: DynamicFieldType
  position?: number
}

@Table({
  tableName: 'project_card_field',
  modelName: 'project_card_field',
  timestamps: true,
  indexes: [
    {
      name: 'project_card_field_card_key_unique',
      unique: true,
      fields: ['card_id', 'key'],
    },
  ],
})
export class ProjectCardField extends Model<
  ProjectCardField,
  ProjectCardFieldCreationAttributes
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
  @Column(DataType.STRING)
  declare key: string

  @AllowNull(false)
  @Column(DataType.STRING)
  declare label: string

  @Column(DataType.JSONB)
  declare value: JsonValue

  @AllowNull(false)
  @Default(DynamicFieldType.TEXT)
  @Column(DataType.STRING)
  declare field_type: DynamicFieldType

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare position: number

  @BelongsTo(() => ProjectCard, 'card_id')
  declare card: ProjectCard
}
