import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select, { type SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  getUsersForNotif,
  pushSuperadminNotification,
} from '@/api/http/notification'
import { queryKeys } from '@/api/http/QueryKeys'
import { notify } from '@/context/notification/notify'
import type { UserId } from '@/types/UserId'

const NotificationsSuperadmin = () => {
  const { t } = useTranslation()
  const [userID, setUserID] = useState<UserId | ''>('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const { data: users = [] } = useQuery({
    queryKey: queryKeys.notificationUsers,
    queryFn: async () => (await getUsersForNotif()) ?? [],
  })

  const submitNotif = () => {
    if (userID && title && body) {
      void pushSuperadminNotification(userID, title, body)
    } else {
      notify.error(t('superadmin:notifications.validation.fillAllFields'))
    }
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Paper sx={{ p: 2 }} component={Stack} variant="outlined" spacing={2}>
        <Typography variant="h6">
          {t('superadmin:notifications.title')}
        </Typography>
        <FormControl fullWidth>
          <InputLabel id="user-select">
            {t('superadmin:notifications.user')}
          </InputLabel>
          <Select
            labelId="user-select"
            value={userID}
            label={t('superadmin:notifications.user')}
            onChange={(e: SelectChangeEvent) => {
              const selectedUser = users.find(
                (user) => user.id === e.target.value
              )
              setUserID(selectedUser?.id ?? '')
            }}
          >
            {users.map((u) => (
              <MenuItem key={`user-${u.id}`} value={u.id}>
                {u.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          label={t('superadmin:notifications.subject')}
        />
        <TextField
          value={body}
          onChange={(e) => setBody(e.target.value)}
          fullWidth
          label={t('superadmin:notifications.message')}
        />
        <Button variant="contained" fullWidth onClick={submitNotif}>
          {t('superadmin:notifications.send')}
        </Button>
      </Paper>
    </Box>
  )
}

export default NotificationsSuperadmin
