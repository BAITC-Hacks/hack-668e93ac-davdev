import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Index,
  Model,
  Table,
} from 'sequelize-typescript'

import { TeamMemberStatus } from '../../types/TeamMemberStatus'
import type { UserID } from '../../types/UserId'
import { User } from '../user/User.model'
import { Team } from './Team.model'

export interface TeamMemberCreationAttributes {
  team_id: string
  user_id: UserID
  status?: TeamMemberStatus
  invited_by?: UserID | null
  joined_at?: Date | null
}

@Table({
  tableName: 'team_member',
  modelName: 'team_member',
  timestamps: true,
  indexes: [
    {
      name: 'team_member_team_user_unique',
      unique: true,
      fields: ['team_id', 'user_id'],
    },
  ],
})
export class TeamMember extends Model<
  TeamMember,
  TeamMemberCreationAttributes
> {
  @Index
  @ForeignKey(() => Team)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare team_id: string

  @Index
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare user_id: UserID

  @AllowNull(false)
  @Default(TeamMemberStatus.PENDING)
  @Column(DataType.STRING)
  declare status: TeamMemberStatus

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare invited_by: UserID | null

  @Column(DataType.DATE)
  declare joined_at: Date | null

  @BelongsTo(() => Team, 'team_id')
  declare team: Team

  @BelongsTo(() => User, 'user_id')
  declare user: User

  @BelongsTo(() => User, 'invited_by')
  declare inviter: User | null
}
