import { Router } from 'express'
import { Op } from 'sequelize'

import requireRole from '../../middleware/requireRole'
import { validateRequest } from '../../middleware/validateRequest'
import { UserRole } from '../../types/UserRole'
import { Tag } from './Tag.model'
import {
  createTagSchema,
  listTagsSchema,
  tagParamsSchema,
  updateTagSchema,
} from './tag.schemas'

const r = Router()

r.get('/', validateRequest(listTagsSchema), async (req, res) => {
  const tags = await Tag.findAll({
    where: req.query.search
      ? { name: { [Op.iLike]: `%${req.query.search}%` } }
      : undefined,
    order: [['name', 'ASC']],
  })

  return res.json(tags)
})

r.post(
  '/',
  requireRole([UserRole.SUPERADMIN]),
  validateRequest(createTagSchema),
  async (req, res) => {
    const [tag, created] = await Tag.findOrCreate({
      where: { name: req.body.name },
      defaults: req.body,
    })

    return res.status(created ? 201 : 200).json(tag)
  }
)

r.patch(
  '/:tagId',
  requireRole([UserRole.SUPERADMIN]),
  validateRequest({
    ...tagParamsSchema,
    ...updateTagSchema,
  }),
  async (req, res) => {
    const tag = await Tag.findByPk(req.params.tagId)

    if (!tag) {
      return res.status(404).json({ message: 'tag_not_found' })
    }

    await tag.update(req.body)
    return res.json(tag)
  }
)

export { r as tagRouter }
