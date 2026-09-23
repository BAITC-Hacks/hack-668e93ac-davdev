import type { Language } from '@/types/Languages'

const langNames: Record<Language, string> = {
  en: 'ENG',
  ru: 'РУС',
  kk: 'ҚАЗ',
}

export const getLangName = (lang: Language) => langNames[lang]
