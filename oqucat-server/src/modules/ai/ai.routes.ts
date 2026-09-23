import { Router } from 'express'
import { toFile } from 'openai'

import cfg from '@/config'
import { logger } from '@/logger'
import { generateVoice } from '@/modules/llm/generateVoice'
import { getOpenaiResponse } from '@/modules/llm/getOpenaiResponse'
import { openai } from '@/modules/llm/openai'
import { getVasyaSystemMessage } from '@/modules/llm/systemMessage'

const r = Router()

const isSupportedAudio = (mimeType: string, fileName: string) =>
  mimeType.startsWith('audio/') ||
  mimeType === 'video/webm' ||
  (mimeType === 'application/octet-stream' &&
    /\.(?:ogg|webm)$/iu.test(fileName))

r.post('/voice', async (req, res) => {
  const audio = req.files?.audio

  if (
    !audio ||
    Array.isArray(audio) ||
    audio.truncated ||
    !isSupportedAudio(audio.mimetype, audio.name)
  ) {
    return res.status(400).json({ message: 'invalidfile' })
  }

  const language = req.user.locale

  const transcription = await openai.audio.transcriptions.create({
    file: await toFile(audio.data, audio.name, { type: audio.mimetype }),
    model: cfg.LLM_TRANSCRIPTION_MODEL,
    language,
  })
  const input = transcription.text.trim()

  console.log(input)

  if (!input) {
    return res.status(400).json({ message: 'invalidfile' })
  }

  const response = await getOpenaiResponse({
    input,
    email: req.user.email,
    instructions: getVasyaSystemMessage(language),
  })
  const voice = await generateVoice(response.text)

  return res.type('audio/mpeg').send(voice)
})

r.post('/realtime/session', async (_req, res) => {
  const response = await fetch(`${cfg.LLM_HOST}realtime/client_secrets`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.LLM_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      session: {
        type: 'realtime',
        model: cfg.LLM_REALTIME_MODEL,
        audio: {
          output: {
            voice: 'marin',
          },
        },
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()

    console.error('Failed to create OpenAI Realtime session:', error)

    return res.status(502).json({
      error: 'Failed to create realtime session',
    })
  }

  const data = await response.json()

  return res.json(data)
})

export { r as aiRouter }
