import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import { type Dispatch, type SetStateAction, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  MdVisibility as Visibility,
  MdVisibilityOff as VisibilityOff,
} from 'react-icons/md'

interface IPasswordField {
  password: string
  setPassword: Dispatch<SetStateAction<string>>
  onKeyDown?: (e: React.KeyboardEvent) => void
  autocomplete?: string
  label?: string
  autoFocus?: boolean
}

const PasswordField = ({
  password,
  setPassword,
  onKeyDown,
  autocomplete = 'current-password',
  label,
  autoFocus = false,
}: IPasswordField) => {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)

  return (
    <TextField
      label={label ?? t('common:fields.password')}
      type={showPassword ? 'text' : 'password'}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      fullWidth
      name="password"
      autoComplete={autocomplete}
      onKeyDown={(e) => onKeyDown?.(e)}
      autoFocus={autoFocus}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onMouseDown={() => setShowPassword(true)}
                onMouseUp={() => setShowPassword(false)}
                onMouseLeave={() => setShowPassword(false)}
                onTouchStart={() => setShowPassword(true)}
                onTouchEnd={() => setShowPassword(false)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  )
}

export default PasswordField
