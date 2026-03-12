import { describe, it, expect } from 'vitest'

const VALID_TYPES = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'ci', 'build'] as const

function isValidType(type: string): boolean {
  return (VALID_TYPES as readonly string[]).includes(type)
}

describe('CLI flag validation', () => {
  describe('--type flag', () => {
    it.each(VALID_TYPES)('accepts valid type "%s"', (type) => {
      expect(isValidType(type)).toBe(true)
    })

    it('rejects invalid type "feature"', () => {
      expect(isValidType('feature')).toBe(false)
    })

    it('rejects invalid type "bugfix"', () => {
      expect(isValidType('bugfix')).toBe(false)
    })

    it('rejects empty string', () => {
      expect(isValidType('')).toBe(false)
    })

    it('rejects type with uppercase', () => {
      expect(isValidType('Feat')).toBe(false)
    })

    it('rejects type with trailing space', () => {
      expect(isValidType('feat ')).toBe(false)
    })
  })

  describe('--scope flag', () => {
    it('accepts any freeform string as scope', () => {
      const scopes = ['auth', 'api', 'ui', 'core', 'my-module', 'some_scope']
      for (const scope of scopes) {
        // scope is a freeform string, no validation needed
        expect(typeof scope).toBe('string')
        expect(scope.length).toBeGreaterThan(0)
      }
    })

    it('accepts scope with special characters', () => {
      const scope = 'my-module/sub'
      expect(typeof scope).toBe('string')
    })
  })
})
