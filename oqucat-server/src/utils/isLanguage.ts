import { languages, type Language } from '@/types/Languages'

export const isLanguage = (value: unknown): value is Language =>
  typeof value === 'string' && languages.some((language) => language === value)
