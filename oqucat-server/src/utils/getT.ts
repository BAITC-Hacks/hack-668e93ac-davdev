import i18next from 'i18next'

import type { Language } from '../types/Languages'

const getT = (locale?: Language) => i18next.getFixedT(locale ?? 'en')

export default getT
