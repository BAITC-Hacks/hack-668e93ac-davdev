import type { CardFieldType, CardInput, JsonValue } from '@/types/ProjectCard'

export interface EditableField {
  key: string
  label: string
  field_type: CardFieldType
  text: string
}

const isJson = (value: unknown): value is JsonValue =>
  value === null ||
  typeof value === 'string' ||
  typeof value === 'boolean' ||
  (typeof value === 'number' && Number.isFinite(value)) ||
  (Array.isArray(value)
    ? value.every(isJson)
    : typeof value === 'object' && Object.values(value).every(isJson))

export const editableFields = (fields: CardInput['fields']): EditableField[] =>
  fields.map((field) => ({
    key: field.key,
    label: field.label,
    field_type: field.field_type,
    text:
      field.value === null
        ? ''
        : typeof field.value === 'object'
          ? JSON.stringify(field.value, null, 2)
          : String(field.value),
  }))

export const parseFields = (fields: EditableField[]): CardInput['fields'] =>
  fields.map(({ key, label, field_type, text }, position) => {
    let value: JsonValue = text.trim() || null
    if (!label.trim()) {
      throw new Error('invalid_fields')
    }
    if (text.trim()) {
      if (field_type === 'number') {
        value = Number(text)
        if (!Number.isFinite(value)) {
          throw new TypeError('invalid_fields')
        }
      }
      if (field_type === 'boolean') {
        if (!['true', 'false'].includes(text)) {
          throw new Error('invalid_fields')
        }
        value = text === 'true'
      }
      if (field_type === 'json') {
        try {
          const parsed: unknown = JSON.parse(text)
          if (!isJson(parsed)) {
            throw new Error('invalid_fields')
          }
          value = parsed
        } catch {
          throw new Error('invalid_fields')
        }
      }
      if (field_type === 'url') {
        try {
          if (!['http:', 'https:'].includes(new URL(text).protocol)) {
            throw new Error('invalid_fields')
          }
        } catch {
          throw new Error('invalid_fields')
        }
      }
      if (
        field_type === 'date' &&
        (!/^\d{4}-\d{2}-\d{2}$/u.test(text) ||
          !Number.isFinite(Date.parse(text)) ||
          new Date(text).toISOString().slice(0, 10) !== text)
      ) {
        throw new Error('invalid_fields')
      }
    }
    return { key, label: label.trim(), field_type, value, position }
  })
