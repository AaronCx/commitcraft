import { generateWithAnthropic } from '../providers/anthropic.js'
import { generateWithOpenAI } from '../providers/openai.js'

export interface AIOptions {
  provider: 'anthropic' | 'openai'
  model?: string
  apiKey: string
}

export async function generateCommitMessage(diff: string, options: AIOptions): Promise<string> {
  try {
    if (options.provider === 'anthropic') {
      return await generateWithAnthropic(diff, options.apiKey, options.model)
    } else {
      return await generateWithOpenAI(diff, options.apiKey, options.model)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)

    if (message.includes('401') || message.includes('authentication') || message.includes('invalid')) {
      throw new Error(
        `Invalid API key for ${options.provider}. Run: commitcraft config set ${options.provider === 'anthropic' ? 'anthropicApiKey' : 'openaiApiKey'} YOUR_KEY`,
      )
    }
    if (message.includes('429') || message.includes('rate')) {
      throw new Error('Rate limited by the AI provider. Please wait a moment and try again.')
    }
    throw new Error(`AI generation failed: ${message}`)
  }
}
