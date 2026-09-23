import i18next from 'i18next'

import cfg from './config'
import en from './locales/en/common.json'
import kk from './locales/kk/common.json'
import ru from './locales/ru/common.json'

export const initI18n = () =>
  i18next.init({
    interpolation: {
      defaultVariables: {
        app: cfg.APP_NAME,
      },
    },
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      kk: { translation: kk },
    },
    fallbackLng: 'ru',
  })
