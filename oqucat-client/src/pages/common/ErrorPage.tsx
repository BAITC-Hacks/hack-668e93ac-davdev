import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { IconType } from 'react-icons'
import { FaTelegram as TelegramIcon } from 'react-icons/fa6'
import {
  MdArrowBackIosNew as ArrowBackIosNewIcon,
  MdLinkOff as LinkOffIcon,
  MdSentimentVeryDissatisfied as SentimentVeryDissatisfiedIcon,
} from 'react-icons/md'
import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
  useSearchParams,
} from 'react-router-dom'

import DecryptedText from '@/components/react-bits/DecryptedText'
import ElectricBorder from '@/components/react-bits/ElectricBorder'

const email = 'contact@dav-dev.kz'

interface ErrorData {
  icon: IconType
  title: string
  body: string
}

const formatErrorData = (data: unknown) => {
  if (typeof data === 'string') {
    return data
  }

  if (data instanceof Error) {
    return data.message
  }

  try {
    return JSON.stringify(data)
  } catch {
    return String(data)
  }
}

const ErrorPage = () => {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const routeError = useRouteError()

  const handleReturn = () => {
    void navigate('/menu')
  }

  const error = isRouteErrorResponse(routeError)
    ? {
        status: routeError.status,
        statusText: routeError.statusText,
        data: formatErrorData(routeError.data),
      }
    : routeError instanceof Error
      ? {
          status: undefined,
          statusText: undefined,
          data: routeError.message,
        }
      : null

  const errorData: ErrorData = useMemo(() => {
    if (
      searchParams.get('error') === 'account_already_linked_to_different_user'
    ) {
      return {
        icon: LinkOffIcon,
        title: t('common:errors.alreadyLinkedTitle'),
        body: t('common:errors.alreadyLinkedBody'),
      }
    }
    if (searchParams.get('type') === 'telegram') {
      return {
        icon: TelegramIcon,
        title: t('common:errors.telegram.title'),
        body: t('common:errors.telegram.body'),
      }
    }
    return {
      icon: SentimentVeryDissatisfiedIcon,
      title: t('common:errors.generic.title'),
      body: t('common:errors.generic.body'),
    }
  }, [searchParams, t])

  const emailParams = useMemo(
    () =>
      new URLSearchParams({
        subject: t('common:errors.emailSubject'),
        body: t('common:errors.emailBody'),
      }),
    [t]
  )

  return (
    // <Grow in>
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <ElectricBorder
        color="#ff7d7d"
        speed={0.3}
        chaos={0.12}
        // thickness={2}
        // style={{ borderRadius: 16 }}
      >
        <Paper
          elevation={3}
          sx={{
            width: '100%',
            maxWidth: 520,
            p: { xs: 3, sm: 5 },
            textAlign: 'center',
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <errorData.icon size={64} />
          </Box>

          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            <DecryptedText
              text={errorData.title}
              animateOn="view"
              revealDirection="start"
              useOriginalCharsOnly
            />
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mt: 1,
              lineHeight: 1.7,
            }}
          >
            <DecryptedText
              text={errorData.body}
              animateOn="view"
              revealDirection="start"
              useOriginalCharsOnly
            />
          </Typography>

          {error && (
            <Paper variant="outlined" sx={{ py: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {error.data}
              </Typography>
            </Paper>
          )}

          <Button
            variant="outlined"
            size="large"
            fullWidth
            onClick={handleReturn}
            startIcon={<ArrowBackIosNewIcon />}
            sx={{ mt: 2 }}
          >
            {t('common:actions.return')}
          </Button>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mt: 1,
              lineHeight: 1.7,
            }}
          >
            {t('common:errors.supportPrompt')}{' '}
            <Link
              href={`mailto:${email}?${emailParams}`}
              target="_blank"
              rel="noreferer"
            >
              {email}
            </Link>
          </Typography>
        </Paper>
      </ElectricBorder>
    </Box>
    // </Grow>
  )
}

export default ErrorPage
