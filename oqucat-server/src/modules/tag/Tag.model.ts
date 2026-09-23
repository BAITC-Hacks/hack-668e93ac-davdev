import {
  AllowNull,
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript'
import { uuidv7 } from 'uuidv7'

export interface TagCreationAttributes {
  name: string
  logo?: string | null
}

@Table({ tableName: 'tag', modelName: 'tag', timestamps: true })
export class Tag extends Model<Tag, TagCreationAttributes> {
  @PrimaryKey
  @Default(uuidv7)
  @Column(DataType.UUID)
  declare id: string

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  declare name: string

  @Column(DataType.STRING)
  declare logo: string | null
}
