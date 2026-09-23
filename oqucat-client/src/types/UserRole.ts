export enum UserRole {
  USER = 'user',
  SUPERADMIN = 'superadmin',
}

export const isUserRole = (value: unknown): value is UserRole =>
  typeof value === 'string' &&
  Object.values(UserRole).map(String).includes(value)
