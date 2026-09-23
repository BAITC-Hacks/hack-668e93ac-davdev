import { Router } from 'express'

import { validateRequest } from '../../middleware/validateRequest'
import { Review } from '../review/Review.model'
import { StudentProfile } from '../student/StudentProfile.model'
import { Team } from '../team/Team.model'
import { User } from '../user/User.model'
import { leaderboardSchema } from './points.schemas'

const r = Router()

const getAverageRating = async (where: {
  student_id?: string
  team_id?: string
}) => {
  const reviews = await Review.findAll({ where, attributes: ['rating'] })
  if (reviews.length === 0) {
    return null
  }
  return (
    reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
  )
}

r.get('/students', validateRequest(leaderboardSchema), async (req, res) => {
  const students = await StudentProfile.findAll({
    include: [
      {
        model: User,
        attributes: ['id', 'name', 'image'],
      },
    ],
    order: [['points_balance', 'DESC']],
    limit: req.query.limit,
  })

  return res.json(
    await Promise.all(
      students.map(async (student, index) => ({
        rank: index + 1,
        student: student.toJSON(),
        rating: await getAverageRating({ student_id: student.user_id }),
      }))
    )
  )
})

r.get('/teams', validateRequest(leaderboardSchema), async (req, res) => {
  const teams = await Team.findAll({
    include: [
      {
        model: User,
        attributes: ['id', 'name', 'image'],
      },
    ],
    order: [['points_balance', 'DESC']],
    limit: req.query.limit,
  })

  return res.json(
    await Promise.all(
      teams.map(async (team, index) => ({
        rank: index + 1,
        team: team.toJSON(),
        rating: await getAverageRating({ team_id: team.id }),
      }))
    )
  )
})

export { r as leaderboardRouter }
