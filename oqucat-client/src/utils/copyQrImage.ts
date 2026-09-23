import { copyToClipboard } from './copyToClipboard'

export const copyQrImage = (id: string) => {
  const canvas = document.querySelector<HTMLCanvasElement>(`#qr-${id}`)

  if (!canvas) {
    return
  }

  canvas.toBlob((blob) => {
    if (!blob) {
      return
    }

    void copyToClipboard('image/png', blob)
  })
}
