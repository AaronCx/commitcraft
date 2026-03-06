import { describe, it, expect } from 'vitest'
import { validateCommitMessage } from '../src/core/formatter.js'

describe('validateCommitMessage', () => {
  it('accepts valid conventional commit', () => {
    expect(validateCommitMessage('feat(auth): add login')).toBe(true)
  })

  it('accepts breaking change with !', () => {
    expect(validateCommitMessage('feat!: breaking change')).toBe(true)
  })

  it('accepts commit without scope', () => {
    expect(validateCommitMessage('fix: correct typo')).toBe(true)
  })

  it('rejects random text', () => {
    expect(validateCommitMessage('random text')).toBe(false)
  })

  it('rejects message exceeding 72 characters', () => {
    expect(
      validateCommitMessage(
        'fix: something very long that exceeds 72 characters in total length here and keeps going',
      ),
    ).toBe(false)
  })

  it('accepts all valid commit types', () => {
    const types = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'ci', 'build']
    for (const type of types) {
      expect(validateCommitMessage(`${type}: do something`)).toBe(true)
    }
  })
})
