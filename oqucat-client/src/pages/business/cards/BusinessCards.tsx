import {
  Alert,
  Box,
  Button,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { getCard, getCardCompany } from '@/api/http/cards'
import { queryKeys } from '@/api/http/QueryKeys'
import { useAuthSession } from '@/auth/betterAuth'
import type { CardDetails } from '@/types/ProjectCard'

import CardEditor from './CardEditor'
import { cardError } from './cardError'
import CardList from './CardList'
import CompanySetup from './CompanySetup'
import CreateCardIntro from './CreateCardIntro'

const BusinessCards = () => {
  const { t } = useTranslation('business')
  const { data: session } = useAuthSession()
  const userId = session?.user?.id
  const queryClient = useQueryClient()
  const [params, setParams] = useSearchParams()
  const id = params.get('card')
  const company = useQuery({
    queryKey: [...queryKeys.marketplace(userId), 'company'],
    queryFn: ({ signal }) => getCardCompany(signal),
    enabled: Boolean(userId),
    retry: false,
  })
  const selected = useQuery({
    queryKey: queryKeys.card(userId, id ?? ''),
    queryFn: ({ signal }) => getCard(id ?? '', signal),
    enabled: Boolean(userId && id && id !== 'new'),
    retry: false,
  })
  const open = (card?: CardDetails) => {
    if (card) {
      queryClient.setQueryData(queryKeys.card(userId, card.card.id), card)
    }
    setParams({ tab: 'cards', ...(card ? { card: card.card.id } : {}) })
  }
  if (company.isLoading) {
    return <LinearProgress />
  }
  if (company.isError) {
    return (
      <Alert
        severity="error"
        action={
          <Button
            onClick={() => {
              void company.refetch()
            }}
          >
            {t('retry')}
          </Button>
        }
      >
        {cardError(company.error)}
      </Alert>
    )
  }
  if (company.data === null) {
    return (
      <CompanySetup
        onCreated={() => {
          void company.refetch()
        }}
      />
    )
  }
  if (id === 'new') {
    return <CardEditor key="new" onBack={() => open()} onCreated={open} />
  }
  if (id) {
    if (selected.isError) {
      return (
        <Stack spacing={2}>
          <Button onClick={() => open()}>{t('back')}</Button>
          <Alert
            severity="error"
            action={
              <Button
                onClick={() => {
                  void selected.refetch()
                }}
              >
                {t('retry')}
              </Button>
            }
          >
            {cardError(selected.error)}
          </Alert>
        </Stack>
      )
    }
    if (!selected.data) {
      return <LinearProgress />
    }
    return (
      <CardEditor
        key={id}
        initial={selected.data}
        onBack={() => open()}
        onCreated={open}
      />
    )
  }
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="overline" color="text.secondary">
          {company.data?.name}
        </Typography>
        <Typography variant="h4" component="h1">
          {t('title')}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {t('subtitle')}
        </Typography>
      </Box>
      <CreateCardIntro
        onManual={() => setParams({ tab: 'cards', card: 'new' })}
        onCreated={(card) => {
          open(card)
          void queryClient.invalidateQueries({
            queryKey: queryKeys.marketplace(userId),
          })
        }}
      />
      <CardList onOpen={open} userId={userId} />
    </Stack>
  )
}
export default BusinessCards
