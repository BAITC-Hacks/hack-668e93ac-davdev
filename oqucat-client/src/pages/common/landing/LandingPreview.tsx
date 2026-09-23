import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { MdArrowDownward, MdCheck, MdNorthEast } from 'react-icons/md'

const initials = ['A', 'D', 'M']

const LandingPreview = () => {
  const { t } = useTranslation('user')

  return (
    <Box
      sx={{
        position: 'relative',
        p: { xs: 2.5, sm: 4 },
        bgcolor: '#e8eee3',
        borderRadius: 5,
        color: '#1b2b21',
        backgroundImage: 'radial-gradient(#bac8b5 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
      >
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {t('landing.preview.label')}
        </Typography>
        <MdNorthEast size={24} />
      </Stack>
      <Box
        sx={{
          bgcolor: '#fff',
          border: '1px solid #d6dfd0',
          borderRadius: 3,
          p: 3,
          boxShadow: '0 12px 32px #243e2010',
        }}
      >
        <Typography sx={{ fontSize: 12, color: '#59684f', mb: 1.5 }}>
          {t('landing.preview.business')}
        </Typography>
        <Typography sx={{ fontWeight: 700, fontSize: 23, lineHeight: 1.3 }}>
          {t('examples.booking.title')}
        </Typography>
        <Typography
          sx={{ fontSize: 14, color: '#59684f', mt: 1.5, lineHeight: 1.6 }}
        >
          {t('examples.booking.summary')}
        </Typography>
        <Stack
          direction="row"
          sx={{
            borderTop: '1px solid #e6eae2',
            mt: 2.5,
            pt: 2,
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Typography sx={{ fontSize: 13 }}>
            {t('tasks.duration', { count: 4 })}
          </Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
            {t('tasks.points', { count: 240 })}
          </Typography>
        </Stack>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}>
        <MdArrowDownward size={24} />
      </Box>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          bgcolor: '#243c2b',
          color: '#fff',
          p: 2.5,
          borderRadius: 3,
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexShrink: 0,
            '& .MuiAvatar-root': {
              width: 34,
              height: 34,
              fontSize: 14,
              bgcolor: '#d3edaa',
              color: '#25301e',
              border: '2px solid #243c2b',
              '& + .MuiAvatar-root': { ml: -1 },
            },
          }}
        >
          {initials.map((initial) => (
            <Avatar key={initial}>{initial}</Avatar>
          ))}
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700 }}>
            {t('landing.preview.team')}
          </Typography>
          <Typography sx={{ color: '#cad9c9', fontSize: 12, mt: 0.5 }}>
            {t('landing.preview.idea')}
          </Typography>
        </Box>
      </Stack>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          gap: 1.5,
          bgcolor: '#d3edaa',
          p: 2,
          borderRadius: 2.5,
          mt: 2,
          ml: { sm: 5 },
        }}
      >
        <MdCheck size={24} />
        <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
          {t('landing.preview.result')}
        </Typography>
      </Stack>
      <Typography
        sx={{ fontSize: 11, mt: 2.5, color: '#59684f', textAlign: 'center' }}
      >
        {t('landing.preview.example')}
      </Typography>
    </Box>
  )
}

export default LandingPreview
