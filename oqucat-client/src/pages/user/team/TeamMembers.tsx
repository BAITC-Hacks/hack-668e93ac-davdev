import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { queryKeys } from '@/api/http/QueryKeys'
import { removeTeamMember } from '@/api/http/teams'
import type { TeamDetails, TeamMember } from '@/types/Team'
import { getAvatar } from '@/utils/getAvatar'
import { getMarketplaceError } from '@/utils/getMarketplaceError'

const TeamMembers = ({
  details,
  userId,
}: {
  details: TeamDetails
  userId: string
}) => {
  const { t } = useTranslation('user')
  const client = useQueryClient()
  const [target, setTarget] = useState<TeamMember | null>(null)
  const isCaptain = details.team.captain_id === userId
  const mutation = useMutation({
    mutationFn: (memberId: string) =>
      removeTeamMember(details.team.id, memberId),
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: queryKeys.marketplace(userId),
      })
      setTarget(null)
    },
  })
  const close = () => {
    if (!mutation.isPending) {
      setTarget(null)
      mutation.reset()
    }
  }

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        {t('team.members')}
      </Typography>
      <Stack spacing={2}>
        {details.members.map(({ membership }) => (
          <Stack
            key={membership.user_id}
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ alignItems: { sm: 'center' }, py: 1 }}
          >
            <Stack
              direction="row"
              spacing={2}
              sx={{ alignItems: 'center', flex: 1, minWidth: 0 }}
            >
              <Avatar src={getAvatar(membership.user?.image)} alt="" />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>
                  {membership.user?.name || membership.user_id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t(`team.memberStatus.${membership.status}`)}
                </Typography>
              </Box>
            </Stack>
            {membership.user_id === details.team.captain_id ? (
              <Chip label={t('team.captain')} />
            ) : (
              (isCaptain || membership.user_id === userId) && (
                <Button
                  color="error"
                  onClick={() => {
                    mutation.reset()
                    setTarget(membership)
                  }}
                >
                  {t(
                    membership.user_id === userId
                      ? 'team.leave'
                      : membership.status === 'accepted'
                        ? 'team.remove'
                        : 'team.revoke'
                  )}
                </Button>
              )
            )}
          </Stack>
        ))}
      </Stack>
      <Dialog
        open={target !== null}
        onClose={close}
        aria-labelledby="member-confirm-title"
      >
        <DialogTitle id="member-confirm-title">
          {t(target?.user_id === userId ? 'team.leave' : 'team.remove')}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {t('team.removeConfirm', {
              name: target?.user?.name || target?.user_id,
            })}
          </Typography>
          {mutation.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {getMarketplaceError(mutation.error)}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={close} disabled={mutation.isPending}>
            {t('common:actions.cancel')}
          </Button>
          <Button
            color="error"
            disabled={!target || mutation.isPending}
            loading={mutation.isPending}
            onClick={() => {
              if (target) {
                mutation.mutate(target.user_id)
              }
            }}
          >
            {t('marketplace.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default TeamMembers
