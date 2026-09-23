import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Model,
  Table,
} from 'sequelize-typescript'

import { Tag } from '../tag/Tag.model'
import { ProjectCard } from './ProjectCard.model'

export interface ProjectCardTagCreationAttributes {
  card_id: string
  tag_id: string
}

@Table({
  tableName: 'project_card_tag',
  modelName: 'project_card_tag',
  timestamps: true,
  indexes: [
    {
      name: 'project_card_tag_card_tag_unique',
      unique: true,
      fields: ['card_id', 'tag_id'],
    },
  ],
})
export class ProjectCardTag extends Model<
  ProjectCardTag,
  ProjectCardTagCreationAttributes
> {
  @Index
  @ForeignKey(() => ProjectCard)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare card_id: string

  @Index
  @ForeignKey(() => Tag)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare tag_id: string

  @BelongsTo(() => ProjectCard, 'card_id')
  declare card: ProjectCard

  @BelongsTo(() => Tag, 'tag_id')
  declare tag: Tag
}
