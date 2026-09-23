import OpenAI from 'openai'

import cfg from '../../config'

export const openai = new OpenAI({
  apiKey: cfg.LLM_KEY,
  baseURL: cfg.LLM_HOST,
})
