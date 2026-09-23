export const languages = ['ru', 'en', 'kk'] as const

export type Language = (typeof languages)[number]
