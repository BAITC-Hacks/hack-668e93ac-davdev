import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import { useColorScheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { MdDarkMode, MdLightMode } from 'react-icons/md'

import { languages } from '@/types/Languages'

const PlatformControls = () => {
  const { t, i18n } = useTranslation('user')
  const { mode, systemMode, setMode } = useColorScheme()
  const isDark = (mode === 'system' ? systemMode : mode) === 'dark'

  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
      <Select
        size="small"
        value={i18n.resolvedLanguage ?? 'ru'}
        onChange={(event) => {
          void i18n.changeLanguage(event.target.value)
        }}
        inputProps={{ 'aria-label': t('navigation.language') }}
        sx={{ fontSize: 13, '& fieldset': { border: 0 } }}
      >
        {languages.map((language) => (
          <MenuItem key={language} value={language}>
            {language.toUpperCase()}
          </MenuItem>
        ))}
      </Select>
      <IconButton
        aria-label={t(
          isDark ? 'navigation.lightTheme' : 'navigation.darkTheme'
        )}
        onClick={() => setMode(isDark ? 'light' : 'dark')}
        size="small"
      >
        {isDark ? <MdLightMode /> : <MdDarkMode />}
      </IconButton>
    </Stack>
  )
}

export default PlatformControls
