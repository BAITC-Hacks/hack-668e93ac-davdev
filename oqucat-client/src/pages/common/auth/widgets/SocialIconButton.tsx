import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import type { ReactNode } from 'react'

interface SocialIconButtonProps {
  ariaLabel: string
  icon: ReactNode
  loading?: boolean
  onClick: () => void
}

const SocialIconButton = ({
  ariaLabel,
  icon,
  loading = false,
  onClick,
}: SocialIconButtonProps) => (
  <Tooltip title={ariaLabel}>
    <span>
      <IconButton
        aria-label={ariaLabel}
        disabled={loading}
        onClick={onClick}
        sx={{
          width: 48,
          height: 48,
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        {loading ? <CircularProgress size={22} /> : icon}
      </IconButton>
    </span>
  </Tooltip>
)

export default SocialIconButton
