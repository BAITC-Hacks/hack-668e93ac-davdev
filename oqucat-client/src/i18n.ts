import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

import { appName } from '@/config'

import { languages } from './types/Languages'

const localeUrls = import.meta.glob<string>('./locales/*/*.json', {
  eager: true,
  query: '?url',
  import: 'default',
})

const initializeI18n = async () => {
  await i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      backend: {
        loadPath: (lngs: string[], namespacesToLoad: string[]) => {
          const [lng] = lngs
          const [namespace] = namespacesToLoad

          return localeUrls[`./locales/${lng}/${namespace}.json`]
        },
      },

      fallbackLng: languages[0],

      ns: ['common'],
      defaultNS: 'common',
      fallbackNS: 'common',

      supportedLngs: languages,

      load: 'languageOnly',

      cleanCode: true,
      nonExplicitSupportedLngs: true,

      interpolation: {
        defaultVariables: { appName },
        escapeValue: false,
      },
    })

  document.documentElement.lang = i18n.resolvedLanguage ?? i18n.language
  document.documentElement.dir = i18n.dir()
}

void initializeI18n()

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng
  document.documentElement.dir = i18n.dir(lng)
})

export default i18n
