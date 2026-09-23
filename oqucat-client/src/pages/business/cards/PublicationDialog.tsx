import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type useCardEditor from './useCardEditor'

const PublicationDialog = ({
  editor,
}: {
  editor: ReturnType<typeof useCardEditor>
}) => {
  const { t } = useTranslation('business')
  const [open, setOpen] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const stale = editor.dirty || editor.answersDirty || !editor.currentReview
  return (
    <>
      <Button
        variant="contained"
        disabled={editor.busy || stale}
        onClick={() => {
          setConfirmed(false)
          setOpen(true)
        }}
      >
        {t('publish')}
      </Button>
      <Dialog
        open={open}
        onClose={() => {
          if (!editor.busy) {
            setOpen(false)
          }
        }}
      >
        <DialogTitle>{t('confirm.title')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('confirm.description', { title: editor.input.title })}
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={confirmed}
                onChange={(_, value) => setConfirmed(value)}
              />
            }
            label={t('confirm.check')}
          />
        </DialogContent>
        <DialogActions>
          <Button disabled={editor.busy} onClick={() => setOpen(false)}>
            {t('cancel')}
          </Button>
          <Button
            variant="contained"
            disabled={editor.busy || !confirmed || stale}
            onClick={() => {
              void (async () => {
                if (await editor.publish()) {
                  setOpen(false)
                }
              })()
            }}
          >
            {t('publish')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
export default PublicationDialog
