import cfg from '@/config'

import { openai } from './openai'
import { getSafetyIdentifier } from './safetyIdentifier'
import { SYSTEM_MESSAGE } from './systemMessage'

type ChunkCallback = (chunk: string) => void

interface GetOpenaiResponseOptions {
  input: string
  email: string
  instructions?: string
  previousResponseId?: string
  onChunk?: ChunkCallback
}

interface OpenaiResponse {
  text: string
  responseId: string
}

export const getOpenaiResponse = async ({
  input,
  email,
  instructions = SYSTEM_MESSAGE,
  previousResponseId,
  onChunk,
}: GetOpenaiResponseOptions): Promise<OpenaiResponse> => {
  const params = {
    model: cfg.LLM_MODEL,
    input,
    instructions,
    safety_identifier: getSafetyIdentifier(email),
    previous_response_id: previousResponseId,
  }

  if (!onChunk) {
    const response = await openai.responses.create(params)

    return {
      text: response.output_text,
      responseId: response.id,
    }
  }

  const stream = await openai.responses.create({
    ...params,
    stream: true,
  })

  let text = ''
  let responseId: string | undefined

  for await (const event of stream) {
    switch (event.type) {
      case 'response.created': {
        responseId = event.response.id
        break
      }

      case 'response.output_text.delta': {
        text += event.delta
        onChunk(event.delta)
        break
      }
      default: {
        break
      }
    }
  }

  if (!responseId) {
    throw new Error('OpenAI stream completed without a response ID')
  }

  return {
    text,
    responseId,
  }
}
