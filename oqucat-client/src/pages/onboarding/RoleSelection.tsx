import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState, type ComponentType } from 'react'
import { useTranslation } from 'react-i18next'
import {
  MdBusiness as BusinessIcon,
  MdSchool as SchoolIcon,
} from 'react-icons/md'
import { useNavigate } from 'react-router-dom'

import { selectRole } from '@/api/http/onboarding'
import { authClient, useAuthSession } from '@/auth/betterAuth'
import { UserRole, type SelectableUserRole } from '@/types/UserRole'

interface RoleChoice {
  role: SelectableUserRole
  icon: ComponentType
  translationKey: 'student' | 'business'
}

const choices: RoleChoice[] = [
  {
    role: UserRole.USER,
    icon: SchoolIcon,
    translationKey: 'student',
  },
  {
    role: UserRole.BUSINESS,
    icon: BusinessIcon,
    translationKey: 'business',
  },
]

const RoleSelection = () => {
  const { t } = useTranslation()
  const { refetch } = useAuthSession()
  const navigate = useNavigate()
  const [pendingRole, setPendingRole] = useState<SelectableUserRole | null>(
    null
  )
  const [loading, setLoading] = useState(false)

  const confirmRole = async () => {
    if (!pendingRole) {
      return
    }

    setLoading(true)
    const result = await selectRole(pendingRole)

    if (result) {
      setPendingRole(null)
      await refetch()
    }

    setLoading(false)
  }

  const signOut = async () => {
    await authClient.signOut()
    void navigate('/login', { replace: true })
  }

  const selectedChoice = choices.find(({ role }) => role === pendingRole)

  return (
    <Stack spacing={3} sx={{ maxWidth: 900, mx: 'auto', py: 4, px: 2 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('common:onboarding.title')}
        </Typography>
        <Typography color="text.secondary">
          {t('common:onboarding.description')}
        </Typography>
      </Box>

      <Alert severity="warning">{t('common:onboarding.permanent')}</Alert>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
        }}
      >
        {choices.map(({ icon: Icon, role, translationKey }) => (
          <Card key={role} variant="outlined">
            <CardContent>
              <Box sx={{ color: 'primary.main', fontSize: 48, mb: 1 }}>
                <Icon />
              </Box>
              <Typography variant="h5" component="h2" gutterBottom>
                {t(`common:onboarding.roles.${translationKey}.title`)}
              </Typography>
              <Typography color="text.secondary">
                {t(`common:onboarding.roles.${translationKey}.description`)}
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setPendingRole(role)}
              >
                {t(`common:onboarding.roles.${translationKey}.action`)}
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>

      <Button color="inherit" onClick={signOut} sx={{ alignSelf: 'center' }}>
        {t('common:actions.exit')}
      </Button>

      <Dialog
        open={pendingRole !== null}
        onClose={() => !loading && setPendingRole(null)}
      >
        <DialogTitle>{t('common:onboarding.confirm.title')}</DialogTitle>
        <DialogContent>
          {selectedChoice
            ? t('common:onboarding.confirm.description', {
                role: t(
                  `common:onboarding.roles.${selectedChoice.translationKey}.title`
                ),
              })
            : null}
        </DialogContent>
        <DialogActions>
          <Button disabled={loading} onClick={() => setPendingRole(null)}>
            {t('common:actions.cancel')}
          </Button>
          <Button loading={loading} variant="contained" onClick={confirmRole}>
            {t('common:onboarding.confirm.action')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

export default RoleSelection
