import {
  AllowNull,
  Column,
  DataType,
  Index,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript'

import type { UserID } from '@/types/UserId'

interface VerificationCreationAttributes {
  identifier: string
  value: string
  expiresAt: Date
}

@Table({
  tableName: 'verification',
  modelName: 'verification',
  timestamps: true,
})
export class Verification extends Model<
  Verification,
  VerificationCreationAttributes
> {
  @PrimaryKey
  @Column(DataType.UUID)
  declare id: UserID

  @AllowNull(false)
  @Index
  @Column(DataType.STRING)
  declare identifier: string

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare value: string

  @AllowNull(false)
  @Column(DataType.DATE)
  declare expiresAt: Date
}
