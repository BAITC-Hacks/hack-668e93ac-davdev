import { useTranslation } from 'react-i18next'

import { authClient } from '@/auth/betterAuth'
import RubberSegment from '@/components/react-bits/RubberSegment'
import { languages } from '@/types/Languages'
import getLocale from '@/utils/getLocale'
import { useThemeColors } from '@/utils/useThemeColors'

import { changeLanguage } from './changeLanguage'

const LandingLangChip = () => {
  const { i18n } = useTranslation()
  const { data } = authClient.useSession()
  const user = data?.user
  const colors = useThemeColors()
  const items = languages.map((lang) => ({
    value: lang,
    label: '',
    icon: (
      <img
        src={`/images/flags/${lang}.svg`}
        alt=""
        aria-hidden="true"
        className="landing-lang-flag h-5 w-7 object-cover pointer-events-none"
        // style={{ borderColor: colors.foreground }}
      />
    ),
  }))

  return (
    <RubberSegment
      items={items}
      defaultValue={getLocale(i18n)}
      onChange={(value) => changeLanguage(user, i18n, value)}
      trackColor={colors.background}
      thumbColor={colors.foreground}
      textColor={colors.text}
      activeTextColor={colors.contrastText}
      size="md"
      radius={10}
      inset={3}
      equalSlots
      squash={3}
      speed={1}
      glide={75}
      draggable
      disabled={false}
    />
  )
}

export default LandingLangChip
