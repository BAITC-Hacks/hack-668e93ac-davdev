import {
  Alert,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { createCardCompany } from '@/api/http/cards'

import { cardError } from './cardError'

const CompanySetup = ({ onCreated }: { onCreated: () => void }) => {
  const { t } = useTranslation('business')
  const [name, setName] = useState('')
  const create = useMutation({
    mutationFn: () => createCardCompany(name.trim()),
    onSuccess: onCreated,
  })
  return (
    <Paper
      component="form"
      variant="outlined"
      sx={{ p: 4, maxWidth: 600 }}
      onSubmit={(event) => {
        event.preventDefault()
        create.mutate()
      }}
    >
      <Stack spacing={3}>
        <Typography variant="h4" component="h1">
          {t('company.title')}
        </Typography>
        <Typography>{t('company.description')}</Typography>
        <TextField
          required
          disabled={create.isPending}
          label={t('company.name')}
          value={name}
          onChange={(event) => setName(event.target.value)}
          slotProps={{ htmlInput: { minLength: 2, maxLength: 120 } }}
        />
        {create.isError && (
          <Alert severity="error">{cardError(create.error)}</Alert>
        )}
        <Button
          type="submit"
          variant="contained"
          disabled={create.isPending || name.trim().length < 2}
        >
          {t('company.create')}
        </Button>
      </Stack>
    </Paper>
  )
}
export default CompanySetup
