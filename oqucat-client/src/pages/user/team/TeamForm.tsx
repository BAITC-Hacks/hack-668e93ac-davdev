import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { queryKeys } from '@/api/http/QueryKeys'
import { createTeam, updateTeam } from '@/api/http/teams'
import { useAuthSession } from '@/auth/betterAuth'
import type { Team, TeamInput } from '@/types/Team'
import { getMarketplaceError, isWebUrl } from '@/utils/getMarketplaceError'

interface TeamFormProps {
  team?: Team
  onClose: () => void
  onSaved: (id: string) => void
}

const TeamForm = ({ team, onClose, onSaved }: TeamFormProps) => {
  const { t } = useTranslation('user')
  const { data } = useAuthSession()
  const client = useQueryClient()
  const [name, setName] = useState(team?.name ?? '')
  const [logo, setLogo] = useState(team?.logo ?? '')
  const validName = name.trim().length >= 2 && name.trim().length <= 120
  const validLogo = !logo.trim() || isWebUrl(logo.trim())
  const mutation = useMutation({
    mutationFn: (input: TeamInput) =>
      team ? updateTeam(team.id, input) : createTeam(input),
    onSuccess: async (result) => {
      await client.invalidateQueries({
        queryKey: queryKeys.marketplace(data?.user?.id),
      })
      onSaved(result.team.id)
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
      aria-labelledby="team-form-title"
    >
      <DialogTitle id="team-form-title">
        {t(team ? 'team.edit' : 'team.create')}
      </DialogTitle>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (validName && validLogo && !mutation.isPending) {
            mutation.mutate({ name: name.trim(), logo: logo.trim() || null })
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
              label={t('team.name')}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              disabled={mutation.isPending}
              error={Boolean(name) && !validName}
              helperText={t('team.nameHint')}
              slotProps={{ htmlInput: { minLength: 2, maxLength: 120 } }}
            />
            <TextField
              label={t('team.logo')}
              value={logo}
              onChange={(event) => setLogo(event.target.value)}
              type="url"
              disabled={mutation.isPending}
              error={!validLogo}
              helperText={t('team.logoHint')}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={mutation.isPending}>
            {t('common:actions.cancel')}
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={!validName || !validLogo || mutation.isPending}
            loading={mutation.isPending}
          >
            {t(team ? 'common:actions.save' : 'team.create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default TeamForm
