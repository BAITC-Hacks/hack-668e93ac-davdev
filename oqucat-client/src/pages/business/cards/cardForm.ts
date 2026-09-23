import type { CardDetails, CardInput, CardTextKey } from '@/types/ProjectCard'

export const cardTextFields: { key: CardTextKey; max: number }[] = [
  { key: 'title', max: 200 },
  { key: 'context', max: 10_000 },
  { key: 'need', max: 10_000 },
  { key: 'target_users', max: 5000 },
  { key: 'data', max: 10_000 },
  { key: 'constraints', max: 10_000 },
  { key: 'expected_result', max: 10_000 },
  { key: 'success_criteria', max: 10_000 },
  { key: 'contact', max: 2000 },
  { key: 'interaction_format', max: 5000 },
]

export const cardInput = (details?: CardDetails): CardInput => {
  const card = details
    ? details.card
    : {
        title: '',
        context: '',
        need: '',
        target_users: '',
        data: '',
        constraints: '',
        expected_result: '',
        success_criteria: '',
        contact: '',
        interaction_format: '',
      }
  return {
    title: card.title,
    context: card.context ?? '',
    need: card.need ?? '',
    target_users: card.target_users ?? '',
    data: card.data ?? '',
    constraints: card.constraints ?? '',
    expected_result: card.expected_result ?? '',
    success_criteria: card.success_criteria ?? '',
    contact: card.contact ?? '',
    interaction_format: card.interaction_format ?? '',
    fields:
      details?.fields.map(({ key, label, value, field_type, position }) => ({
        key,
        label,
        value,
        field_type,
        position,
      })) ?? [],
    tag_ids: details?.tags.map(({ id }) => id) ?? [],
  }
}

export const readiness = (score: number) =>
  score >= 90
    ? 'priority'
    : score >= 70
      ? 'ready'
      : score >= 40
        ? 'workable'
        : 'draft'
