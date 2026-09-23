import Button from '@mui/material/Button'
import { useTranslation } from 'react-i18next'
import { MdArrowBackIosNew as ArrowBackIosNewIcon } from 'react-icons/md'
import { Link } from 'react-router-dom'

const BackToLoginButton = () => {
  const { t } = useTranslation()

  return (
    <Button
      component={Link}
      to="/login"
      variant="outlined"
      size="large"
      fullWidth
      startIcon={<ArrowBackIosNewIcon />}
      sx={{ mt: 2 }}
    >
      {t('common:auth.backToLogin')}
    </Button>
  )
}

export default BackToLoginButton
