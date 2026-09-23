import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  cardInput,
  readiness,
} from '../../oqucat-client/src/pages/business/cards/cardForm'
import {
  editableFields,
  parseFields,
} from '../../oqucat-client/src/pages/business/cards/dynamicFieldValues'
import {
  createProjectCardSchema,
  updateProjectCardSchema,
  projectCardFieldSchema,
  createAiProjectCardSchema,
  publishCardSchema,
} from '../src/modules/card/card.schemas'
import { sameCardContent } from '../src/modules/card/cardContent'
import { reviewResponseSchema } from '../src/modules/card/cardReview.schema'

const snapshot = {
  card: {
    title: 'Request tracker',
    context: 'Requests are in a spreadsheet',
    completeness_score: 85,
    status: 'draft',
  },
  fields: [
    {
      id: 'old',
      key: 'budget',
      label: 'Budget',
      value: 0,
      field_type: 'number',
      position: 0,
    },
  ],
  tags: [{ id: 'tag-a', name: 'Web' }],
}

await test('publication requires explicit confirmation and a concrete reviewed version', () => {
  const id = '123e4567-e89b-42d3-a456-426614174000'
  assert.equal(publishCardSchema.body.safeParse({}).success, false)
  assert.equal(
    publishCardSchema.body.safeParse({ confirmed: false, review_id: id })
      .success,
    false
  )
  assert.equal(
    publishCardSchema.body.safeParse({ confirmed: true, review_id: id })
      .success,
    true
  )
  assert.equal(
    projectCardFieldSchema.safeParse({
      key: 'deadline',
      label: 'Deadline',
      field_type: 'date',
      value: '2026-02-31',
    }).success,
    false
  )
})

await test('review survives publication and regenerated field IDs but not edited content', () => {
  assert.equal(
    sameCardContent(snapshot, {
      ...snapshot,
      card: { ...snapshot.card, status: 'published', completeness_score: 90 },
      fields: [{ ...snapshot.fields[0], id: 'new' }],
    }),
    true
  )
  assert.equal(
    sameCardContent(snapshot, {
      ...snapshot,
      card: { ...snapshot.card, context: '' },
    }),
    false
  )
  assert.equal(
    sameCardContent(snapshot, {
      ...snapshot,
      fields: [{ ...snapshot.fields[0], value: 100 }],
    }),
    false
  )
  assert.equal(sameCardContent(snapshot, { ...snapshot, tags: [] }), false)
})

await test('empty manual draft is rejected but a title-only low-readiness draft is allowed', () => {
  assert.equal(
    createProjectCardSchema.body.safeParse({ title: '  ' }).success,
    false
  )
  assert.equal(
    createProjectCardSchema.body.safeParse({ title: 'Request tracker' })
      .success,
    true
  )
  assert.equal(
    createAiProjectCardSchema.body.safeParse({ description: 'short' }).success,
    false
  )
})

await test('atomic edit validates fields and tags together, and strips client scores/status', () => {
  const parsed = updateProjectCardSchema.body.parse({
    title: ' Updated ',
    fields: [
      { key: 'budget', label: 'Budget', value: 0, field_type: 'number' },
    ],
    tag_ids: [],
    completeness_score: 100,
    reward_points: 9999,
    status: 'published',
  })
  assert.equal(parsed.title, 'Updated')
  assert.deepEqual(parsed.tag_ids, [])
  assert.equal(parsed.fields?.[0].value, 0)
  assert.equal('completeness_score' in parsed, false)
  assert.equal('reward_points' in parsed, false)
  assert.equal('status' in parsed, false)
  assert.equal(
    updateProjectCardSchema.body.safeParse({ title: 'A', tag_ids: ['invalid'] })
      .success,
    false
  )
})

await test('typed field validation rejects unsafe links and mismatched values', () => {
  const field = { key: 'extra', label: 'Extra' }
  for (const value of [
    { field_type: 'number', value: '123' },
    { field_type: 'boolean', value: 'false' },
    { field_type: 'date', value: 'tomorrow' },
    { field_type: 'url', value: 'javascript:alert(1)' },
  ]) {
    assert.equal(
      projectCardFieldSchema.safeParse({ ...field, ...value }).success,
      false
    )
  }
  for (const value of [
    { field_type: 'number', value: 0 },
    { field_type: 'boolean', value: false },
    { field_type: 'date', value: '2026-09-23' },
    { field_type: 'url', value: 'https://example.com' },
    { field_type: 'json', value: { data: [false, null, 0] } },
  ]) {
    assert.equal(
      projectCardFieldSchema.safeParse({ ...field, ...value }).success,
      true
    )
  }
})

const maxima = {
  context_and_need: 20,
  data_and_materials: 20,
  expected_result: 15,
  success_criteria: 15,
  constraints: 10,
  target_users: 10,
  business_contact: 10,
}
const rating = Object.fromEntries(
  Object.entries(maxima).map(([key, max_points]) => [
    key,
    {
      name: key,
      points: max_points,
      max_points,
      expected: 'Complete information',
      got: 'Provided',
    },
  ])
)

await test('AI rating has exactly seven fixed criteria totalling 100, reward is separate', () => {
  const result = reviewResponseSchema.parse({ rating, reward_points: 750 })
  assert.equal(
    Object.values(result.rating).reduce((sum, item) => sum + item.points, 0),
    100
  )
  assert.equal(result.reward_points, 750)
  assert.equal(
    reviewResponseSchema.safeParse({
      rating: { ...rating, bonus: rating.constraints },
      reward_points: 750,
    }).success,
    false
  )
  assert.equal(
    reviewResponseSchema.safeParse({
      rating: { ...rating, constraints: { ...rating.constraints, points: 11 } },
      reward_points: 750,
    }).success,
    false
  )
  assert.equal(
    reviewResponseSchema.safeParse({ rating: {}, reward_points: 750 }).success,
    false
  )
  assert.equal(
    reviewResponseSchema.safeParse({ rating, reward_points: -1 }).success,
    false
  )
})

await test('readiness can decrease and all level boundaries match the case', () => {
  assert.deepEqual([0, 39, 40, 69, 70, 89, 90, 100].map(readiness), [
    'draft',
    'draft',
    'workable',
    'workable',
    'ready',
    'ready',
    'priority',
    'priority',
  ])
  assert.equal(readiness(100), 'priority')
  assert.equal(readiness(20), 'draft')
})

await test('custom fields round-trip false, zero, JSON and null without data loss', () => {
  const fields = [
    {
      key: 'count',
      label: 'Count',
      field_type: 'number' as const,
      value: 0,
      position: 0,
    },
    {
      key: 'access',
      label: 'Access',
      field_type: 'boolean' as const,
      value: false,
      position: 1,
    },
    {
      key: 'data',
      label: 'Data',
      field_type: 'json' as const,
      value: { rows: [0, false] },
      position: 2,
    },
    {
      key: 'empty',
      label: 'Empty',
      field_type: 'text' as const,
      value: null,
      position: 3,
    },
  ]
  assert.deepEqual(parseFields(editableFields(fields)), fields)
  assert.throws(
    () =>
      parseFields([
        { key: 'data', label: 'Data', field_type: 'json', text: '{broken}' },
      ]),
    /invalid_fields/
  )
  assert.throws(
    () =>
      parseFields([
        { key: 'data', label: '', field_type: 'text', text: 'value' },
      ]),
    /invalid_fields/
  )
  assert.throws(
    () =>
      parseFields([
        { key: 'data', label: 'Data', field_type: 'number', text: 'Infinity' },
      ]),
    /invalid_fields/
  )
  assert.equal(
    createProjectCardSchema.body.safeParse({
      ...cardInput(),
      title: 'Manual draft',
    }).success,
    true
  )
})
