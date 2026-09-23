export const platforms = ['web', 'android', 'ios'] as const

export type Platform = (typeof platforms)[number]
