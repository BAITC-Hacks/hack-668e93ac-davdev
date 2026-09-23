import {
  Alert,
  Autocomplete,
  Button,
  Paper,
  Stack,
  TextField,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { getCardTags } from '@/api/http/cards'
import { queryKeys } from '@/api/http/QueryKeys'

import { cardTextFields } from './cardForm'
import DynamicFields from './DynamicFields'
import type useCardEditor from './useCardEditor'

const CardEditorForm = ({
  editor,
  editable,
}: {
  editor: ReturnType<typeof useCardEditor>
  editable: boolean
}) => {
  const { t } = useTranslation('business')
  const { input, setInput, fields, setFields, saved, busy, save } = editor
  const tags = useQuery({
    queryKey: queryKeys.marketplaceTags,
    queryFn: ({ signal }) => getCardTags(signal),
    retry: false,
  })
  const options = tags.data ?? saved?.tags ?? []
  const disabled = busy || !editable
  return (
    <Paper
      component="form"
      variant="outlined"
      sx={{ p: 3, borderRadius: 3 }}
      onSubmit={(event) => {
        event.preventDefault()
        void save(true)
      }}
    >
      <Stack
        component="fieldset"
        disabled={disabled}
        spacing={2.5}
        sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
      >
        {cardTextFields.map(({ key, max }) => (
          <TextField
            key={key}
            fullWidth
            label={t(`fields.${key}`)}
            required={key === 'title'}
            multiline={key !== 'title'}
            minRows={key === 'title' ? undefined : 2}
            value={input[key] ?? ''}
            slotProps={{ htmlInput: { maxLength: max } }}
            onChange={(event) =>
              setInput({ ...input, [key]: event.target.value })
            }
          />
        ))}
        {tags.isError && (
          <Alert
            severity="warning"
            action={
              <Button
                onClick={() => {
                  void tags.refetch()
                }}
              >
                {t('retry')}
              </Button>
            }
          >
            {t('tagsError')}
          </Alert>
        )}
        <Autocomplete
          multiple
          disabled={disabled}
          options={options}
          loading={tags.isLoading}
          value={options.filter((tag) => input.tag_ids.includes(tag.id))}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          getOptionLabel={(tag) => tag.name}
          onChange={(_, selected) =>
            setInput({
              ...input,
              tag_ids: selected.map(({ id }) => id).slice(0, 50),
            })
          }
          renderInput={(params) => <TextField {...params} label={t('tags')} />}
        />
        <DynamicFields fields={fields} onChange={setFields} />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button type="submit" variant="contained" disabled={disabled}>
            {t(saved ? 'evaluate' : 'saveDraft')}
          </Button>
          {saved?.card.status === 'draft' && (
            <Button
              disabled={disabled}
              onClick={() => {
                void save(false)
              }}
            >
              {t('saveDraft')}
            </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  )
}
export default CardEditorForm
