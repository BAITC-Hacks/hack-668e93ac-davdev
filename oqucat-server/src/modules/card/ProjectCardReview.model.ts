import { Op, type SaveOptions } from 'sequelize'
import {
  AfterSave,
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

import type { JsonValue } from '../../types/JsonValue'
import type { UserID } from '../../types/UserId'
import { User } from '../user/User.model'
import { ProjectCard } from './ProjectCard.model'

export interface ProjectCardRatingCriterion {
  name: string
  points: number
  max_points: number
  expected: string
  got: string
}

export type ProjectCardRating = Record<string, ProjectCardRatingCriterion>

export type ProjectCardSnapshot = Record<string, JsonValue>

export interface ProjectCardReviewCreationAttributes {
  card_id: string
  requested_by: UserID
  card_copy: ProjectCardSnapshot
  rating?: ProjectCardRating | null
  reviewed_at?: Date | null
}

@Table({
  tableName: 'project_card_review',
  modelName: 'project_card_review',
  timestamps: true,
})
export class ProjectCardReview extends Model<
  ProjectCardReview,
  ProjectCardReviewCreationAttributes
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

  @Index
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare requested_by: UserID

  @AllowNull(false)
  @Column(DataType.JSONB)
  declare card_copy: ProjectCardSnapshot

  @Column(DataType.JSONB)
  declare rating: ProjectCardRating | null

  @Column(DataType.DATE)
  declare reviewed_at: Date | null

  @BelongsTo(() => ProjectCard, 'card_id')
  declare card: ProjectCard

  @BelongsTo(() => User, 'requested_by')
  declare requester: User

  @AfterSave
  static async keepHighestCompleteness(
    review: ProjectCardReview,
    options: SaveOptions
  ) {
    if (!review.rating) {
      return
    }

    const totalPoints = Object.values(review.rating).reduce(
      (total, criterion) => total + criterion.points,
      0
    )
    const completenessScore = Math.min(100, Math.max(0, totalPoints))

    await ProjectCard.update(
      { completeness_score: completenessScore },
      {
        transaction: options.transaction,
        where: {
          id: review.card_id,
          completeness_score: { [Op.lt]: completenessScore },
        },
      }
    )
  }
}
