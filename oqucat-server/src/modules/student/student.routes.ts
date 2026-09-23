import { Router } from 'express'

import sequelize from '../../db'
import requireRole from '../../middleware/requireRole'
import { validateRequest } from '../../middleware/validateRequest'
import type { UserID } from '../../types/UserId'
import { UserRole } from '../../types/UserRole'
import { Company } from '../company/Company.model'
import { Review } from '../review/Review.model'
import { Tag } from '../tag/Tag.model'
import { User } from '../user/User.model'
import {
  studentParamsSchema,
  updateStudentProfileSchema,
  updateStudentTagsSchema,
} from './student.schemas'
import { StudentProfile } from './StudentProfile.model'
import { StudentTag } from './StudentTag.model'

const r = Router()

const serializeStudent = async (userId: UserID) => {
  const [profile, user, studentTags, reviews] = await Promise.all([
    StudentProfile.findByPk(userId),
    User.findByPk(userId, { attributes: ['id', 'name', 'image'] }),
    StudentTag.findAll({
      where: { student_id: userId },
      include: [Tag],
    }),
    Review.findAll({
      where: { student_id: userId },
      attributes: ['rating'],
    }),
  ])

  if (!profile || !user) {
    return null
  }

  const ratingTotal = reviews.reduce(
    (total, review) => total + review.rating,
    0
  )

  return {
    profile: profile.toJSON(),
    user,
    tags: studentTags.map(({ tag }) => tag),
    rating: reviews.length > 0 ? ratingTotal / reviews.length : null,
    reviews_count: reviews.length,
  }
}

r.get('/me', requireRole([UserRole.USER]), async (req, res) => {
  const student = await serializeStudent(req.user.id)

  if (!student) {
    return res.status(404).json({ message: 'student_profile_not_found' })
  }

  return res.json(student)
})

r.put(
  '/me',
  requireRole([UserRole.USER]),
  validateRequest(updateStudentProfileSchema),
  async (req, res) => {
    const company = await Company.findOne({ where: { owner_id: req.user.id } })
    if (company) {
      return res.status(409).json({ message: 'account_is_business' })
    }

    const [profile] = await StudentProfile.findOrCreate({
      where: { user_id: req.user.id },
      defaults: { user_id: req.user.id },
    })

    await profile.update(req.body)
    return res.json(await serializeStudent(req.user.id))
  }
)

r.put(
  '/me/tags',
  requireRole([UserRole.USER]),
  validateRequest(updateStudentTagsSchema),
  async (req, res) => {
    const profile = await StudentProfile.findByPk(req.user.id)

    if (!profile) {
      return res.status(404).json({ message: 'student_profile_not_found' })
    }

    const tagIds = [...new Set(req.body.tag_ids)]
    const tagCount = await Tag.count({ where: { id: tagIds } })

    if (tagCount !== tagIds.length) {
      return res.status(400).json({ message: 'invalid_tags' })
    }

    await sequelize.transaction(async (transaction) => {
      await StudentTag.destroy({
        where: { student_id: req.user.id },
        transaction,
      })
      await StudentTag.bulkCreate(
        tagIds.map((tagId) => ({
          student_id: req.user.id,
          tag_id: tagId,
        })),
        { transaction }
      )
    })

    return res.json(await serializeStudent(req.user.id))
  }
)

r.get('/:userId', validateRequest(studentParamsSchema), async (req, res) => {
  const student = await serializeStudent(req.params.userId)

  if (!student) {
    return res.status(404).json({ message: 'student_profile_not_found' })
  }

  return res.json(student)
})

export { r as studentRouter }
