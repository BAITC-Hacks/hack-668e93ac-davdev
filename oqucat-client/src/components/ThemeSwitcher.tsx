import { useColorScheme } from '@mui/material/styles'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import {
  MdComputer as ComputerIcon,
  MdDarkMode as DarkModeIcon,
  MdLightMode as LightModeIcon,
} from 'react-icons/md'

type Mode = 'light' | 'dark' | 'system'

const ThemeSwitcher = () => {
  const { mode, setMode } = useColorScheme()

  return (
    <ToggleButtonGroup
      fullWidth
      value={mode}
      exclusive
      onChange={(_, v: Mode) => setMode(v)}
      sx={{
        height: 35,
      }}
    >
      <ToggleButton value="light">
        <LightModeIcon size={24} />
      </ToggleButton>
      <ToggleButton value="system">
        <ComputerIcon size={24} />
      </ToggleButton>
      <ToggleButton value="dark">
        <DarkModeIcon size={24} />
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

export default ThemeSwitcher
