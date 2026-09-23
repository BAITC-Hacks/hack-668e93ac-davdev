export const getState = (data: unknown) => {
  if (typeof data === 'string') {
    return data
  }
  return null
}
