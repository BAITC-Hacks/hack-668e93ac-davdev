import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { MdGroups, MdArrowForward } from 'react-icons/md'
import { Link } from 'react-router-dom'

import { getMarketplaceError } from '@/utils/getMarketplaceError'

import type { TeamState } from './Team'
import TeamForm from './TeamForm'
import TeamInvitations from './TeamInvitations'
import TeamMembers from './TeamMembers'
import TeamOverview from './TeamOverview'

const canEditTeam = (state: TeamState) =>
  state.joined.length === 0 || Boolean(state.team && state.captain)

const TeamContent = ({ state }: { state: TeamState }) => {
  const { t } = useTranslation('user')
  const {
    userId,
    profile,
    initialize,
    joined,
    setEditing,
    teamId,
    setSelectedId,
    details,
    memberships,
    captain,
    editing,
    team,
  } = state
  return (
    <>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ overflowWrap: 'anywhere' }}
      >
        {t('team.myId', { id: userId })}
      </Typography>
      {profile.data === null && (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Typography component="h2" variant="h6">
            {t('team.profileRequired')}
          </Typography>
          <Typography color="text.secondary" sx={{ my: 2 }}>
            {t('team.profileDescription')}
          </Typography>
          {initialize.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {getMarketplaceError(initialize.error)}
            </Alert>
          )}
          <Button
            variant="contained"
            onClick={() => initialize.mutate()}
            disabled={initialize.isPending}
            loading={initialize.isPending}
          >
            {t('team.createProfile')}
          </Button>
        </Paper>
      )}
      {joined.length === 0 && (
        <Paper
          variant="outlined"
          sx={{ p: { xs: 3, md: 6 }, borderRadius: 3, textAlign: 'center' }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              p: 3,
              bgcolor: 'action.hover',
              borderRadius: '50%',
              mb: 3,
            }}
          >
            <MdGroups size={48} />
          </Box>
          <Typography component="h2" variant="h5" sx={{ fontWeight: 700 }}>
            {t('team.emptyTitle')}
          </Typography>
          <Typography
            color="text.secondary"
            sx={{
              maxWidth: 520,
              mx: 'auto',
              mt: 2,
              mb: 3,
              lineHeight: 1.8,
            }}
          >
            {t('team.emptyDescription')}
          </Typography>
          <Button
            variant="contained"
            size="large"
            disabled={!profile.data}
            onClick={() => setEditing(true)}
          >
            {t('team.create')}
          </Button>
          <Button
            component={Link}
            to="?tab=tasks"
            endIcon={<MdArrowForward />}
            sx={{ m: 2 }}
          >
            {t('team.explore')}
          </Button>
        </Paper>
      )}
      {joined.length > 1 && (
        <TextField
          select
          label={t('team.choose')}
          value={teamId}
          onChange={(event) => {
            setSelectedId(event.target.value)
            setEditing(false)
          }}
        >
          <MenuItem value="">{t('team.choose')}</MenuItem>
          {joined.map((member) => (
            <MenuItem key={member.team_id} value={member.team_id}>
              {member.team?.name}
            </MenuItem>
          ))}
        </TextField>
      )}
      {teamId && details.isFetching && (
        <LinearProgress aria-label={t('marketplace.loading')} />
      )}
      {teamId && details.isError && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              onClick={() => {
                void details.refetch()
              }}
            >
              {t('marketplace.retry')}
            </Button>
          }
        >
          {getMarketplaceError(details.error)}
        </Alert>
      )}
      {teamId && details.isSuccess && <TeamOverview state={state} />}
      {details.isSuccess && userId && (
        <TeamMembers
          key={`members-${teamId}`}
          details={details.data}
          userId={userId}
        />
      )}
      {userId && (
        <TeamInvitations
          key={`invitations-${teamId}`}
          memberships={memberships.data ?? []}
          userId={userId}
          captainTeamId={captain ? teamId : undefined}
          canJoin={joined.length === 0 && Boolean(profile.data)}
        />
      )}
      {editing && canEditTeam(state) && (
        <TeamForm
          key={`form-${teamId || 'new'}`}
          team={team}
          onClose={() => setEditing(false)}
          onSaved={(id) => {
            setSelectedId(id)
            setEditing(false)
          }}
        />
      )}
    </>
  )
}

export default TeamContent
