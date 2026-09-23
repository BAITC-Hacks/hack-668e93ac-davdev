export const identifierTypes = ['fid', 'token'] as const

export type IdentifierType = (typeof identifierTypes)[number]
