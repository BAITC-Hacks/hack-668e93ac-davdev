import { notify } from '@/context/notification/notify'
import i18n from '@/i18n'

export const copyToClipboard = async (type: string, value: string | Blob) => {
  await navigator.clipboard.write([new ClipboardItem({ [type]: value })])
  notify.success(i18n.t('common:feedback.qrCopied'))
}
