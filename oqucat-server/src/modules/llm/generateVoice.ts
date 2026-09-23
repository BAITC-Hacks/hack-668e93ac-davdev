import cfg from '@/config'

import { openai } from './openai'

export const generateVoice = async (text: string) => {
  const response = await openai.audio.speech.create({
    model: cfg.LLM_TTS_MODEL,
    voice: cfg.LLM_TTS_VOICE,
    input: text,
    response_format: 'mp3',
  })

  return Buffer.from(await response.arrayBuffer())
}
