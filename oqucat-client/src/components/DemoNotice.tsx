import Alert from '@mui/material/Alert'
import { useTranslation } from 'react-i18next'

const DemoNotice = () => {
  const { t } = useTranslation('user')

  return (
    <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
      {t('demo.notice')}
    </Alert>
  )
}

export default DemoNotice
