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

import type { UserID } from '../../types/UserId'
import { User } from '../user/User.model'

export interface StudentProfileCreationAttributes {
  user_id: UserID
  portfolio?: string | null
  social_links?: Record<string, string>
  website?: string | null
  page_theme?: Record<string, unknown> | null
  points_balance?: number
}

@Table({
  tableName: 'student_profile',
  modelName: 'student_profile',
  timestamps: true,
})
export class StudentProfile extends Model<
  StudentProfile,
  StudentProfileCreationAttributes
> {
  @PrimaryKey
  @Index
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare user_id: UserID

  @Column(DataType.TEXT)
  declare portfolio: string | null

  @AllowNull(false)
  @Default({})
  @Column(DataType.JSONB)
  declare social_links: Record<string, string>

  @Column(DataType.STRING)
  declare website: string | null

  @Column(DataType.JSONB)
  declare page_theme: Record<string, unknown> | null

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Cached balance derived from the student point history ledger',
  })
  declare points_balance: number

  @BelongsTo(() => User, 'user_id')
  declare user: User
}
