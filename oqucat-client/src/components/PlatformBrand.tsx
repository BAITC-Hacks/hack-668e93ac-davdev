import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Link } from 'react-router-dom'

import { appName } from '@/config'

const PlatformBrand = () => (
  <Box
    component={Link}
    to="/"
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 1.25,
      color: 'inherit',
      textDecoration: 'none',
    }}
  >
    <Box
      component="img"
      src="/logo-small.svg"
      alt=""
      sx={(theme) => ({
        width: 34,
        height: 34,
        ...theme.applyStyles('dark', { filter: 'brightness(0) invert(1)' }),
      })}
    />
    <Typography
      component="span"
      sx={{ fontWeight: 700, fontSize: 24, letterSpacing: '-0.04em' }}
    >
      {appName || 'OquCat'}
    </Typography>
  </Box>
)

export default PlatformBrand
