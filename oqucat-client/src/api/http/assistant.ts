import { apiRequest, host } from '.'

export const getAssistantVoiceResponse = (audio: Blob, language: string) => {
  const formData = new FormData()
  const extension = audio.type.includes('ogg') ? 'ogg' : 'webm'

  formData.set('audio', audio, `speech.${extension}`)
  formData.set('language', language)

  return apiRequest<ArrayBuffer>(
    host.post('ai/voice', formData, {
      responseType: 'arraybuffer',
    })
  )
}
