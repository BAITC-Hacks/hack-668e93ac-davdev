import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { MdArrowForward, MdSend } from 'react-icons/md'
import { Link } from 'react-router-dom'

import DemoNotice from '@/components/DemoNotice'

const Responses = () => {
  const { t } = useTranslation('user')

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="overline" color="text.secondary">
          {t('responses.eyebrow')}
        </Typography>
        <Typography
          component="h1"
          sx={{ fontSize: { xs: 30, md: 40 }, fontWeight: 700 }}
        >
          {t('responses.title')}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {t('responses.subtitle')}
        </Typography>
      </Box>
      <DemoNotice />
      <Paper
        variant="outlined"
        sx={{ borderRadius: 3, p: { xs: 3, md: 7 }, textAlign: 'center' }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            p: 3,
            bgcolor: 'action.hover',
            borderRadius: '50%',
            mb: 3,
          }}
        >
          <MdSend size={40} />
        </Box>
        <Typography component="h2" variant="h5" sx={{ fontWeight: 700 }}>
          {t('responses.emptyTitle')}
        </Typography>
        <Typography
          color="text.secondary"
          sx={{ maxWidth: 530, mx: 'auto', mt: 2, mb: 3, lineHeight: 1.8 }}
        >
          {t('responses.emptyDescription')}
        </Typography>
        <Button
          component={Link}
          to="?tab=tasks"
          variant="contained"
          endIcon={<MdArrowForward />}
        >
          {t('responses.explore')}
        </Button>
      </Paper>
      <Paper variant="outlined" sx={{ borderRadius: 3, p: 3 }}>
        <Typography component="h2" variant="h6">
          {t('responses.processTitle')}
        </Typography>
        <Box
          component="ol"
          sx={{ pl: 2.5, color: 'text.secondary', '& li': { py: 1 } }}
        >
          {['idea', 'review', 'result'].map((step) => (
            <li key={step}>{t(`responses.steps.${step}`)}</li>
          ))}
        </Box>
      </Paper>
    </Stack>
  )
}

export default Responses
