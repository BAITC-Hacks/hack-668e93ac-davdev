import { isRecord } from './isRecord'

export const isRecentAccount = (value: unknown): boolean => {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.last_used === 'number' &&
    (typeof value.image === 'string' ||
      value.image === null ||
      value.image === undefined)
  )
}
