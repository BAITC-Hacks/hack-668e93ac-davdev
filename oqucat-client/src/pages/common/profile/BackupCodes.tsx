import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { MdDownload as DownloadIcon } from 'react-icons/md'

import { appName } from '@/config'

interface BackupCodesProps {
  codes: string[]
}

const BackupCodes = ({ codes }: BackupCodesProps) => {
  const { t } = useTranslation()

  if (codes.length === 0) {
    return null
  }

  const handleDownload = () => {
    const blob = new Blob([codes.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `${appName}-two-factor-recovery-codes.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Stack spacing={1}>
      <Divider />
      <Typography variant="body2">
        {t('common:profile.twoFactor.backupCodesDescription')}
      </Typography>
      <Button
        variant="outlined"
        size="small"
        startIcon={<DownloadIcon />}
        onClick={handleDownload}
      >
        {t('common:profile.twoFactor.downloadBackupCodes')}
      </Button>
    </Stack>
  )
}

export default BackupCodes
