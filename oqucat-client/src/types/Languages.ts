export const languages = ['ru', 'kk', 'en'] as const

export type Language = (typeof languages)[number]

export const isLanguage = (value: string): value is Language =>
  (languages as readonly string[]).includes(value)
