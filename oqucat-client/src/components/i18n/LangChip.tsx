import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'

import { authClient } from '@/auth/betterAuth'
import { languages } from '@/types/Languages'
import getLocale from '@/utils/getLocale'

import { changeLanguage } from './changeLanguage'
import { getLangName } from './getLangName'

const LangChip = () => {
  const { i18n } = useTranslation()
  const { data } = authClient.useSession()
  const user = data?.user

  return (
    <ButtonGroup variant="outlined" fullWidth sx={{ height: 35 }}>
      {languages.map((lang) => (
        <Button
          key={lang}
          variant={getLocale(i18n) === lang ? 'contained' : 'outlined'}
          onClick={() => changeLanguage(user, i18n, lang)}
        >
          <img
            src={`images/flags/${lang}.svg`}
            className="mr-1.5 h-5 landing-lang-flag h-5 w-7 object-cover pointer-events-none"
          />
          <Typography sx={{ fontWeight: 'bold' }}>
            {getLangName(lang)}
          </Typography>
        </Button>
      ))}
    </ButtonGroup>
  )
}

export default LangChip
