export interface EmailConfirmationState {
  email: string
  password?: string
}

export const getEmailConfirmationState = (
  data: unknown
): EmailConfirmationState | null => {
  if (typeof data === 'string') {
    return { email: data }
  }

  if (
    typeof data !== 'object' ||
    data === null ||
    !('email' in data) ||
    typeof data.email !== 'string'
  ) {
    return null
  }

  return {
    email: data.email,
    password:
      'password' in data && typeof data.password === 'string'
        ? data.password
        : undefined,
  }
}
