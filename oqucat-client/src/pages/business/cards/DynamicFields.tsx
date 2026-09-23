import {
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { CardFieldType } from '@/types/ProjectCard'

import type { EditableField } from './dynamicFieldValues'

const types: CardFieldType[] = [
  'text',
  'number',
  'boolean',
  'date',
  'url',
  'json',
]

const DynamicFields = ({
  fields,
  onChange,
}: {
  fields: EditableField[]
  onChange: (fields: EditableField[]) => void
}) => {
  const { t } = useTranslation('business')
  const update = (index: number, patch: Partial<EditableField>) =>
    onChange(
      fields.map((field, i) => (i === index ? { ...field, ...patch } : field))
    )
  return (
    <Stack spacing={2}>
      <Typography variant="h6">{t('custom.title')}</Typography>
      {fields.map((field, index) => (
        <Paper key={field.key} variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                required
                label={t('custom.label')}
                value={field.label}
                slotProps={{ htmlInput: { maxLength: 200 } }}
                onChange={(event) =>
                  update(index, { label: event.target.value })
                }
              />
              <TextField
                select
                label={t('custom.type')}
                value={field.field_type}
                sx={{ minWidth: 170 }}
                onChange={(event) => {
                  const type = types.find(
                    (value) => value === event.target.value
                  )
                  if (type) {
                    update(index, { field_type: type, text: '' })
                  }
                }}
              >
                {types.map((type) => (
                  <MenuItem key={type} value={type}>
                    {t(`custom.types.${type}`)}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <TextField
              fullWidth
              label={t('custom.value')}
              value={field.text}
              select={field.field_type === 'boolean'}
              type={
                field.field_type === 'date'
                  ? 'date'
                  : field.field_type === 'number'
                    ? 'number'
                    : field.field_type === 'url'
                      ? 'url'
                      : 'text'
              }
              multiline={['text', 'json'].includes(field.field_type)}
              minRows={
                ['text', 'json'].includes(field.field_type) ? 2 : undefined
              }
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { maxLength: 10_000, step: 'any' },
              }}
              onChange={(event) => update(index, { text: event.target.value })}
            >
              {field.field_type === 'boolean'
                ? [
                    <MenuItem key="empty" value="">
                      {t('custom.unset')}
                    </MenuItem>,
                    <MenuItem key="true" value="true">
                      {t('custom.yes')}
                    </MenuItem>,
                    <MenuItem key="false" value="false">
                      {t('custom.no')}
                    </MenuItem>,
                  ]
                : null}
            </TextField>
            <Button
              color="error"
              onClick={() => onChange(fields.filter((_, i) => i !== index))}
            >
              {t('custom.remove')}
            </Button>
          </Stack>
        </Paper>
      ))}
      <Button
        disabled={fields.length >= 100}
        onClick={() =>
          onChange([
            ...fields,
            {
              key: crypto.randomUUID(),
              label: '',
              field_type: 'text',
              text: '',
            },
          ])
        }
      >
        {t('custom.add')}
      </Button>
    </Stack>
  )
}
export default DynamicFields
