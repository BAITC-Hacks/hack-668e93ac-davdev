import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { queryKeys } from '@/api/http/QueryKeys'
import { inviteTeamMember, respondToInvitation } from '@/api/http/teams'
import type { MyMembership } from '@/types/Team'
import { getMarketplaceError } from '@/utils/getMarketplaceError'

interface TeamInvitationsProps {
  memberships: MyMembership[]
  userId: string
  captainTeamId?: string
  canJoin: boolean
}

const TeamInvitations = ({
  memberships,
  userId,
  captainTeamId,
  canJoin,
}: TeamInvitationsProps) => {
  const { t } = useTranslation('user')
  const client = useQueryClient()
  const [invitee, setInvitee] = useState('')
  const [answer, setAnswer] = useState<{
    teamId: string
    name: string
    status: 'accepted' | 'declined'
  } | null>(null)
  const invalidate = async () => {
    await client.invalidateQueries({ queryKey: queryKeys.marketplace(userId) })
  }
  const invite = useMutation({
    mutationFn: () => inviteTeamMember(captainTeamId ?? '', invitee.trim()),
    onSuccess: async () => {
      setInvitee('')
      await invalidate()
    },
  })
  const respond = useMutation({
    mutationFn: (input: { teamId: string; status: 'accepted' | 'declined' }) =>
      respondToInvitation(input.teamId, input.status),
    onSuccess: async () => {
      await invalidate()
      setAnswer(null)
    },
  })
  const validInvitee =
    /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(
      invitee.trim()
    ) && invitee.trim().toLowerCase() !== userId.toLowerCase()
  const pending = memberships.filter(
    (membership) => membership.status === 'pending' && membership.team
  )

  return (
    <Stack spacing={3}>
      {pending.length > 0 && (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Typography component="h2" variant="h6">
            {t('team.invitations')}
          </Typography>
          {!canJoin && (
            <Alert severity="info" sx={{ my: 2 }}>
              {t('team.oneTeamHint')}
            </Alert>
          )}
          {pending.map((membership) => (
            <Stack
              key={membership.team_id}
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{ mt: 2, alignItems: { sm: 'center' } }}
            >
              <Typography sx={{ flex: 1, overflowWrap: 'anywhere' }}>
                {membership.team?.name}
              </Typography>
              <Button
                disabled={!canJoin || respond.isPending}
                onClick={() => {
                  respond.reset()
                  setAnswer({
                    teamId: membership.team_id,
                    name: membership.team?.name ?? '',
                    status: 'accepted',
                  })
                }}
              >
                {t('team.accept')}
              </Button>
              <Button
                color="inherit"
                disabled={respond.isPending}
                onClick={() => {
                  respond.reset()
                  setAnswer({
                    teamId: membership.team_id,
                    name: membership.team?.name ?? '',
                    status: 'declined',
                  })
                }}
              >
                {t('team.decline')}
              </Button>
            </Stack>
          ))}
        </Paper>
      )}
      {captainTeamId && (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
            {t('team.invite')}
          </Typography>
          <Stack
            component="form"
            spacing={2}
            onSubmit={(event) => {
              event.preventDefault()
              if (validInvitee && !invite.isPending) {
                invite.mutate()
              }
            }}
          >
            {invite.isError && (
              <Alert severity="error">
                {getMarketplaceError(invite.error)}
              </Alert>
            )}
            {invite.isSuccess && (
              <Alert severity="success">{t('team.invited')}</Alert>
            )}
            <TextField
              label={t('team.studentId')}
              value={invitee}
              onChange={(event) => {
                setInvitee(event.target.value)
                if (!invite.isPending) {
                  invite.reset()
                }
              }}
              required
              disabled={invite.isPending}
              helperText={t('team.studentIdHint')}
              error={Boolean(invitee) && !validInvitee}
            />
            <Button
              type="submit"
              variant="outlined"
              disabled={!validInvitee || invite.isPending}
              loading={invite.isPending}
              sx={{ alignSelf: 'flex-start' }}
            >
              {t('team.invite')}
            </Button>
          </Stack>
        </Paper>
      )}
      <Dialog
        open={answer !== null}
        onClose={() => {
          if (!respond.isPending) {
            setAnswer(null)
          }
        }}
        aria-labelledby="invite-confirm-title"
      >
        <DialogTitle id="invite-confirm-title">
          {t(answer?.status === 'accepted' ? 'team.accept' : 'team.decline')}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {t('team.invitationConfirm', { name: answer?.name })}
          </Typography>
          {respond.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {getMarketplaceError(respond.error)}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button disabled={respond.isPending} onClick={() => setAnswer(null)}>
            {t('common:actions.cancel')}
          </Button>
          <Button
            disabled={
              !answer ||
              respond.isPending ||
              (answer.status === 'accepted' && !canJoin)
            }
            loading={respond.isPending}
            onClick={() => {
              if (answer) {
                respond.mutate(answer)
              }
            }}
          >
            {t('marketplace.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

export default TeamInvitations
