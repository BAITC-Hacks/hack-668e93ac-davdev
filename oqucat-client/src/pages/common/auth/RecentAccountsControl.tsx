import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MdDelete as DeleteIcon } from 'react-icons/md'

import type { RecentAccountStore } from '@/types/RecentAccounts'
import { getAvatar } from '@/utils/getAvatar'
import { getRecentAccounts } from '@/utils/recentAccounts/getRecentAccounts'

interface IRecentAccountsControl {
  onRecentClick: (email: string) => void
}

const RecentAccountsControl = ({ onRecentClick }: IRecentAccountsControl) => {
  const { t } = useTranslation()
  const [recentAccounts, setRecentAccounts] =
    useState<RecentAccountStore>(getRecentAccounts)

  const deleteRecentAccount = (email: string) => {
    setRecentAccounts((prev) => {
      const { [email]: _, ...rest } = prev
      return rest
    })
  }

  useEffect(() => {
    localStorage.setItem('recent_accs', JSON.stringify(recentAccounts))
  }, [recentAccounts])

  return Object.keys(recentAccounts).length ? (
    <>
      <Typography>{t('common:auth.recentAccounts.title')}</Typography>
      {Object.entries(recentAccounts).map(([email, data]) => (
        <Paper
          key={`${email}u`}
          component={Stack}
          onClick={() => {
            onRecentClick(email)
          }}
          direction="row"
          spacing={2}
          elevation={3}
          sx={{
            cursor: 'pointer',
            p: 2,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Stack
            direction="row"
            sx={{
              justifyContent: 'center',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Avatar
              src={getAvatar(data.image ?? `${data.id}.webp`) || ''}
              sx={{ height: 50, width: 50 }}
            />
            <Stack>
              <Typography>{data.name}</Typography>
              <Typography variant="caption">{email}</Typography>
            </Stack>
          </Stack>
          <Tooltip title={t('common:actions.forget')} placement="right" arrow>
            <IconButton
              onClick={(e) => {
                e.stopPropagation()
                deleteRecentAccount(email)
              }}
            >
              <DeleteIcon color="error" />
            </IconButton>
          </Tooltip>
        </Paper>
      ))}
      <Divider />
      <Typography>{t('common:auth.recentAccounts.newAccount')}</Typography>
    </>
  ) : (
    // <Typography></Typography>
    ''
  )
}

export default RecentAccountsControl
