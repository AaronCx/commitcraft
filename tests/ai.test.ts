import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../src/providers/anthropic.js', () => ({
  generateWithAnthropic: vi.fn(),
}))

vi.mock('../src/providers/openai.js', () => ({
  generateWithOpenAI: vi.fn(),
}))

import { generateCommitMessage } from '../src/core/ai.js'
import { generateWithAnthropic } from '../src/providers/anthropic.js'
import { generateWithOpenAI } from '../src/providers/openai.js'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('generateCommitMessage', () => {
  it('calls Anthropic when provider is anthropic', async () => {
    vi.mocked(generateWithAnthropic).mockResolvedValue('feat: add login')

    const result = await generateCommitMessage('diff content', {
      provider: 'anthropic',
      apiKey: 'test-key',
    })

    expect(result).toBe('feat: add login')
    expect(generateWithAnthropic).toHaveBeenCalledWith('diff content', 'test-key', undefined, undefined, undefined)
    expect(generateWithOpenAI).not.toHaveBeenCalled()
  })

  it('calls OpenAI when provider is openai', async () => {
    vi.mocked(generateWithOpenAI).mockResolvedValue('fix: correct bug')

    const result = await generateCommitMessage('diff content', {
      provider: 'openai',
      apiKey: 'test-key',
    })

    expect(result).toBe('fix: correct bug')
    expect(generateWithOpenAI).toHaveBeenCalledWith('diff content', 'test-key', undefined, undefined, undefined)
    expect(generateWithAnthropic).not.toHaveBeenCalled()
  })

  it('returns friendly error when API key is invalid', async () => {
    vi.mocked(generateWithAnthropic).mockRejectedValue(new Error('401 authentication error'))

    await expect(
      generateCommitMessage('diff', { provider: 'anthropic', apiKey: 'bad-key' }),
    ).rejects.toThrow('Invalid API key for anthropic')
  })

  it('handles rate limit errors gracefully', async () => {
    vi.mocked(generateWithOpenAI).mockRejectedValue(new Error('429 rate limit exceeded'))

    await expect(
      generateCommitMessage('diff', { provider: 'openai', apiKey: 'key' }),
    ).rejects.toThrow('Rate limited')
  })
})
