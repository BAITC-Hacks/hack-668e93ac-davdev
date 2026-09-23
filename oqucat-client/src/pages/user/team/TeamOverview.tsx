import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'

import { isWebUrl } from '@/utils/getMarketplaceError'

import type { TeamState } from './Team'

const TeamOverview = ({ state }: { state: TeamState }) => {
  const { t } = useTranslation('user')
  const { details, captain, setEditing } = state
  if (!details.isSuccess) {
    return null
  }
  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { sm: 'center' } }}
      >
        <Avatar
          src={
            details.data.team.logo && isWebUrl(details.data.team.logo)
              ? details.data.team.logo
              : undefined
          }
          sx={{ width: 64, height: 64 }}
        >
          {details.data.team.name.slice(0, 1)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            component="h2"
            variant="h5"
            sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}
          >
            {details.data.team.name}
          </Typography>
          <Typography color="text.secondary">
            {t('team.captainName', {
              name: details.data.captain?.name ?? t('marketplace.notSpecified'),
            })}
          </Typography>
          <Typography>
            {t('tasks.points', {
              count: details.data.team.points_balance,
            })}
          </Typography>
        </Box>
        {captain && (
          <Button variant="outlined" onClick={() => setEditing(true)}>
            {t('team.edit')}
          </Button>
        )}
      </Stack>
    </Paper>
  )
}

export default TeamOverview
