import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { createApplication, updateApplication } from '@/api/http/applications'
import { queryKeys } from '@/api/http/QueryKeys'
import { useAuthSession } from '@/auth/betterAuth'
import type {
  ApplicationDetails,
  ApplicationMaterials,
} from '@/types/ProjectApplication'
import type { Team } from '@/types/Team'
import { getMarketplaceError, isWebUrl } from '@/utils/getMarketplaceError'

interface ApplicationFormProps {
  cardId: string
  teams: Team[]
  initial?: ApplicationDetails
  onClose: () => void
  onSaved: () => void
}

const validText = (value: string) =>
  value.trim().length > 0 && value.trim().length <= 10_000

const emptyMaterials: ApplicationMaterials = {
  idea: '',
  plan: '',
  prototype_url: '',
}

const ApplicationForm = ({
  cardId,
  teams,
  initial,
  onClose,
  onSaved,
}: ApplicationFormProps) => {
  const { t } = useTranslation('user')
  const { data } = useAuthSession()
  const userId = data?.user?.id
  const client = useQueryClient()
  const [teamId, setTeamId] = useState(
    initial?.application.team_id ?? (teams.length === 1 ? teams[0].id : '')
  )
  const initialMaterials = initial?.application.materials ?? emptyMaterials
  const [idea, setIdea] = useState(initialMaterials.idea)
  const [plan, setPlan] = useState(initialMaterials.plan)
  const [prototype, setPrototype] = useState(initialMaterials.prototype_url)
  const canSubmit =
    teams.some((team) => team.id === teamId && team.captain_id === userId) &&
    validText(idea) &&
    validText(plan) &&
    isWebUrl(prototype.trim())
  const mutation = useMutation({
    mutationFn: (materials: ApplicationMaterials) =>
      initial
        ? updateApplication(initial.application.id, materials)
        : createApplication({ card_id: cardId, team_id: teamId, materials }),
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: queryKeys.marketplace(userId),
      })
      onSaved()
    },
    onError: async () => {
      await client.invalidateQueries({
        queryKey: queryKeys.myApplications(userId),
      })
    },
  })

  return (
    <Dialog
      open
      onClose={() => {
        if (!mutation.isPending) {
          onClose()
        }
      }}
      fullWidth
      maxWidth="sm"
      aria-labelledby="application-form-title"
    >
      <DialogTitle id="application-form-title">
        {t(initial ? 'responses.edit' : 'tasks.apply')}
      </DialogTitle>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (canSubmit && !mutation.isPending) {
            mutation.mutate({
              idea: idea.trim(),
              plan: plan.trim(),
              prototype_url: prototype.trim(),
            })
          }
        }}
      >
        <DialogContent>
          <Stack spacing={2.5}>
            {mutation.isError && (
              <Alert severity="error">
                {getMarketplaceError(mutation.error)}
              </Alert>
            )}
            <TextField
              select
              required
              label={t('team.title')}
              value={teamId}
              onChange={(event) => setTeamId(event.target.value)}
              disabled={Boolean(initial) || mutation.isPending}
            >
              {teams.map((team) => (
                <MenuItem key={team.id} value={team.id}>
                  {team.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label={t('responses.idea')}
              value={idea}
              onChange={(event) => setIdea(event.target.value)}
              multiline
              minRows={3}
              required
              disabled={mutation.isPending}
              slotProps={{ htmlInput: { maxLength: 10_000 } }}
            />
            <TextField
              label={t('responses.plan')}
              value={plan}
              onChange={(event) => setPlan(event.target.value)}
              multiline
              minRows={3}
              required
              disabled={mutation.isPending}
              slotProps={{ htmlInput: { maxLength: 10_000 } }}
            />
            <TextField
              label={t('responses.prototype')}
              value={prototype}
              onChange={(event) => setPrototype(event.target.value)}
              type="url"
              required
              disabled={mutation.isPending}
              error={Boolean(prototype) && !isWebUrl(prototype.trim())}
              helperText={t('responses.prototypeHint')}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={mutation.isPending}>
            {t('common:actions.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!canSubmit || mutation.isPending}
            loading={mutation.isPending}
          >
            {t(initial ? 'common:actions.save' : 'responses.submit')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default ApplicationForm
