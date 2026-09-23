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

import type { UserID } from '../../types/UserId'
import { Tag } from '../tag/Tag.model'
import { StudentProfile } from './StudentProfile.model'

export interface StudentTagCreationAttributes {
  student_id: UserID
  tag_id: string
}

@Table({
  tableName: 'student_tag',
  modelName: 'student_tag',
  timestamps: true,
  indexes: [
    {
      name: 'student_tag_student_tag_unique',
      unique: true,
      fields: ['student_id', 'tag_id'],
    },
  ],
})
export class StudentTag extends Model<
  StudentTag,
  StudentTagCreationAttributes
> {
  @Index
  @ForeignKey(() => StudentProfile)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare student_id: UserID

  @Index
  @ForeignKey(() => Tag)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare tag_id: string

  @BelongsTo(() => StudentProfile, 'student_id')
  declare student: StudentProfile

  @BelongsTo(() => Tag, 'tag_id')
  declare tag: Tag
}
