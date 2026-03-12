import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { readFileSync, existsSync } from 'fs'

vi.mock('fs', async () => {
  const actual = await vi.importActual<typeof import('fs')>('fs')
  return {
    ...actual,
    readFileSync: vi.fn(actual.readFileSync),
    existsSync: vi.fn(actual.existsSync),
  }
})

// We need to re-import after mocking
const mockedExistsSync = vi.mocked(existsSync)
const mockedReadFileSync = vi.mocked(readFileSync)

describe('config', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('loadProjectConfig', () => {
    it('returns null when .commitcraftrc does not exist', async () => {
      mockedExistsSync.mockReturnValue(false)
      const { loadProjectConfig } = await import('../src/utils/config.js')
      expect(loadProjectConfig()).toBeNull()
    })

    it('reads and parses .commitcraftrc when it exists', async () => {
      const projectConfig = { provider: 'openai', emoji: true }
      mockedExistsSync.mockReturnValue(true)
      mockedReadFileSync.mockReturnValue(JSON.stringify(projectConfig))
      const { loadProjectConfig } = await import('../src/utils/config.js')
      const result = loadProjectConfig()
      expect(result).toEqual(projectConfig)
    })

    it('returns null when .commitcraftrc contains invalid JSON', async () => {
      mockedExistsSync.mockReturnValue(true)
      mockedReadFileSync.mockReturnValue('not valid json {{{')
      const { loadProjectConfig } = await import('../src/utils/config.js')
      expect(loadProjectConfig()).toBeNull()
    })
  })

  describe('getConfig', () => {
    it('returns defaults when no project config exists', async () => {
      mockedExistsSync.mockReturnValue(false)
      const { getConfig } = await import('../src/utils/config.js')
      const cfg = getConfig()
      expect(cfg.provider).toBe('anthropic')
      expect(cfg.emoji).toBe(false)
      expect(cfg.autoCopy).toBe(false)
      expect(cfg.defaultType).toBe('')
    })

    it('merges project config over global defaults', async () => {
      const projectConfig = { provider: 'openai' as const, emoji: true }
      mockedExistsSync.mockReturnValue(true)
      mockedReadFileSync.mockReturnValue(JSON.stringify(projectConfig))
      const { getConfig } = await import('../src/utils/config.js')
      const cfg = getConfig()
      expect(cfg.provider).toBe('openai')
      expect(cfg.emoji).toBe(true)
      // Non-overridden defaults remain
      expect(cfg.autoCopy).toBe(false)
    })
  })

  describe('setConfig', () => {
    it('converts "true" to boolean for autoCopy', async () => {
      const { setConfig, getConfig } = await import('../src/utils/config.js')
      mockedExistsSync.mockReturnValue(false)
      setConfig('autoCopy', 'true')
      const cfg = getConfig()
      expect(cfg.autoCopy).toBe(true)
      // Reset
      setConfig('autoCopy', 'false')
    })

    it('converts "true" to boolean for emoji', async () => {
      const { setConfig, getConfig } = await import('../src/utils/config.js')
      mockedExistsSync.mockReturnValue(false)
      setConfig('emoji', 'true')
      const cfg = getConfig()
      expect(cfg.emoji).toBe(true)
      // Reset
      setConfig('emoji', 'false')
    })

    it('stores string values directly for non-boolean keys', async () => {
      const { setConfig, getConfig } = await import('../src/utils/config.js')
      mockedExistsSync.mockReturnValue(false)
      setConfig('model', 'gpt-4o')
      const cfg = getConfig()
      expect(cfg.model).toBe('gpt-4o')
      // Reset
      setConfig('model', '')
    })
  })
})
