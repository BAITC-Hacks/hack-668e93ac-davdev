import { Router } from 'express'

import requireRole from '../../middleware/requireRole'
import { validateRequest } from '../../middleware/validateRequest'
import { TeamMemberStatus } from '../../types/TeamMemberStatus'
import { UserRole } from '../../types/UserRole'
import { StudentProfile } from '../student/StudentProfile.model'
import { Team } from '../team/Team.model'
import { TeamMember } from '../team/TeamMember.model'
import {
  pointHistoryQuerySchema,
  studentPointsSchema,
  teamPointsSchema,
} from './points.schemas'
import { StudentPointHistory } from './StudentPointHistory.model'
import { TeamPointHistory } from './TeamPointHistory.model'

const r = Router()

r.get(
  '/me',
  validateRequest(pointHistoryQuerySchema),
  requireRole([UserRole.USER]),
  async (req, res) => {
    const [student, studentHistory, memberships] = await Promise.all([
      StudentProfile.findByPk(req.user.id),
      StudentPointHistory.findAll({
        where: { student_id: req.user.id },
        order: [['createdAt', 'DESC']],
        limit: req.query.limit,
      }),
      TeamMember.findAll({
        where: {
          user_id: req.user.id,
          status: TeamMemberStatus.ACCEPTED,
        },
        attributes: ['team_id'],
      }),
    ])
    const teamIds = memberships.map(({ team_id }) => team_id)
    const teamHistory = await TeamPointHistory.findAll({
      where: { team_id: teamIds },
      order: [['createdAt', 'DESC']],
      limit: req.query.limit,
    })

    return res.json({
      student_balance: student?.points_balance ?? null,
      student_history: studentHistory,
      team_history: teamHistory,
    })
  }
)

r.get(
  '/student/:studentId',
  validateRequest(studentPointsSchema),
  async (req, res) => {
    const student = await StudentProfile.findByPk(req.params.studentId)
    if (!student) {
      return res.status(404).json({ message: 'student_profile_not_found' })
    }

    const history = await StudentPointHistory.findAll({
      where: { student_id: student.user_id },
      order: [['createdAt', 'DESC']],
      limit: req.query.limit,
    })
    return res.json({ balance: student.points_balance, history })
  }
)

r.get('/team/:teamId', validateRequest(teamPointsSchema), async (req, res) => {
  const [team, history] = await Promise.all([
    Team.findByPk(req.params.teamId),
    TeamPointHistory.findAll({
      where: { team_id: req.params.teamId },
      order: [['createdAt', 'DESC']],
      limit: req.query.limit,
    }),
  ])
  if (!team) {
    return res.status(404).json({ message: 'team_not_found' })
  }
  return res.json({ balance: team.points_balance, history })
})

export { r as pointsRouter }
