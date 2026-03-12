import { describe, it, expect } from 'vitest'
import { prependEmoji } from '../src/utils/emoji.js'

describe('prependEmoji', () => {
  const typeEmojiMap: Record<string, string> = {
    feat: '\u2728',
    fix: '\uD83D\uDC1B',
    docs: '\uD83D\uDCDD',
    style: '\uD83D\uDC84',
    refactor: '\u267B\uFE0F',
    perf: '\u26A1',
    test: '\u2705',
    chore: '\uD83D\uDD27',
    ci: '\uD83D\uDC77',
    build: '\uD83D\uDCE6',
  }

  it.each(Object.entries(typeEmojiMap))(
    'prepends %s emoji for "%s: ..." message',
    (type, emoji) => {
      const message = `${type}: do something`
      const result = prependEmoji(message)
      expect(result).toBe(`${emoji} ${message}`)
    },
  )

  it('returns message unchanged for unknown type', () => {
    const message = 'unknown: something random'
    expect(prependEmoji(message)).toBe(message)
  })

  it('returns message unchanged for non-conventional message', () => {
    const message = 'just a random message'
    expect(prependEmoji(message)).toBe(message)
  })

  it('prepends emoji for message with scope like feat(auth): ...', () => {
    const message = 'feat(auth): add login endpoint'
    const result = prependEmoji(message)
    expect(result).toBe(`\u2728 ${message}`)
  })

  it('prepends emoji for fix(core): ...', () => {
    const message = 'fix(core): resolve null pointer'
    const result = prependEmoji(message)
    expect(result).toBe(`\uD83D\uDC1B ${message}`)
  })

  it('does not double-prepend emoji', () => {
    const message = 'feat: add feature'
    const once = prependEmoji(message)
    // The second call starts with emoji, not a type keyword, so it returns as-is
    const twice = prependEmoji(once)
    expect(twice).toBe(once)
  })
})
