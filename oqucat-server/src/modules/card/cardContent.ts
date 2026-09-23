import { isDeepStrictEqual } from 'node:util'

import type { JsonValue } from '../../types/JsonValue'

const record = (value: JsonValue | undefined): Record<string, JsonValue> =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}

// Ignore database metadata and scores when deciding whether a review is current.
export const cardContent = (snapshot: Record<string, JsonValue>) => {
  const card = record(snapshot.card)
  return {
    card: Object.fromEntries(
      [
        'title',
        'context',
        'need',
        'target_users',
        'data',
        'constraints',
        'expected_result',
        'success_criteria',
        'contact',
        'interaction_format',
      ].map((key) => [key, card[key] ?? null])
    ),
    fields: (Array.isArray(snapshot.fields) ? snapshot.fields : [])
      .map((item) => {
        const field = record(item)
        return Object.fromEntries(
          ['key', 'label', 'value', 'field_type', 'position'].map((key) => [
            key,
            field[key] ?? null,
          ])
        )
      })
      .toSorted((a, b) =>
        JSON.stringify(a.key).localeCompare(JSON.stringify(b.key))
      ),
    tags: (Array.isArray(snapshot.tags) ? snapshot.tags : [])
      .map((item) => record(item).id)
      .toSorted((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
  }
}

export const sameCardContent = (
  first: Record<string, JsonValue>,
  second: Record<string, JsonValue>
) => isDeepStrictEqual(cardContent(first), cardContent(second))
