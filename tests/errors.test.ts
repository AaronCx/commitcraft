import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock all external dependencies before importing the module under test
vi.mock('../src/core/git.js', () => ({
  isGitRepo: vi.fn(),
  getStagedDiff: vi.fn(),
  getUnstagedDiff: vi.fn(),
  gitCommit: vi.fn(),
  getLastCommitMessage: vi.fn(),
  gitAmend: vi.fn(),
}))

vi.mock('../src/core/ai.js', () => ({
  generateCommitMessage: vi.fn(),
}))

vi.mock('../src/core/formatter.js', () => ({
  validateCommitMessage: vi.fn().mockReturnValue(true),
}))

vi.mock('../src/utils/config.js', () => ({
  getConfig: vi.fn().mockReturnValue({
    provider: 'anthropic',
    anthropicApiKey: '',
    openaiApiKey: '',
    model: '',
    autoCopy: false,
    emoji: false,
    defaultType: '',
  }),
  getApiKey: vi.fn().mockReturnValue('test-key'),
}))

vi.mock('ora', () => ({
  default: () => ({
    start: vi.fn().mockReturnThis(),
    stop: vi.fn(),
    set text(_v: string) {},
  }),
}))

vi.mock('clipboardy', () => ({
  default: { write: vi.fn() },
}))

vi.mock('@inquirer/prompts', () => ({
  confirm: vi.fn().mockResolvedValue(false),
}))

describe('handleGenerate error paths', () => {
  let handleGenerate: typeof import('../src/commands/generate.js').handleGenerate
  let mockExit: ReturnType<typeof vi.spyOn>

  beforeEach(async () => {
    vi.resetModules()
    // Re-import to get fresh mocks
    const mod = await import('../src/commands/generate.js')
    handleGenerate = mod.handleGenerate
    mockExit = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit called')
    }) as never)
  })

  afterEach(() => {
    mockExit.mockRestore()
    vi.restoreAllMocks()
  })

  it('exits when not in a git repo', async () => {
    const git = await import('../src/core/git.js')
    vi.mocked(git.isGitRepo).mockResolvedValue(false)

    await expect(handleGenerate({})).rejects.toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('exits when no API key is configured', async () => {
    const git = await import('../src/core/git.js')
    vi.mocked(git.isGitRepo).mockResolvedValue(true)

    const config = await import('../src/utils/config.js')
    vi.mocked(config.getApiKey).mockReturnValue('')

    await expect(handleGenerate({})).rejects.toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('exits when no diff is available (staged or unstaged)', async () => {
    const git = await import('../src/core/git.js')
    vi.mocked(git.isGitRepo).mockResolvedValue(true)
    vi.mocked(git.getStagedDiff).mockResolvedValue('')
    vi.mocked(git.getUnstagedDiff).mockResolvedValue('')

    const config = await import('../src/utils/config.js')
    vi.mocked(config.getApiKey).mockReturnValue('sk-test-key')

    await expect(handleGenerate({})).rejects.toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)
  })
})
