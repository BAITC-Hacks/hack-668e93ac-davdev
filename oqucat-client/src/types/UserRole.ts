export enum UserRole {
  UNASSIGNED = 'unassigned',
  USER = 'user',
  BUSINESS = 'business',
  SUPERADMIN = 'superadmin',
}

export type SelectableUserRole = UserRole.USER | UserRole.BUSINESS

export const isUserRole = (value: unknown): value is UserRole =>
  typeof value === 'string' &&
  Object.values(UserRole).map(String).includes(value)
