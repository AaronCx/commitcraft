import { describe, it, expect, vi, beforeEach } from 'vitest'
import { spawn } from 'child_process'
import { EventEmitter } from 'events'
import { Readable } from 'stream'

vi.mock('child_process', () => ({
  spawn: vi.fn(),
}))

vi.mock('fs/promises', () => ({
  access: vi.fn(),
}))

import { getStagedDiff, getUnstagedDiff, isGitRepo } from '../src/core/git.js'
import { access } from 'fs/promises'

function createMockProcess(stdout: string, exitCode = 0) {
  const proc = new EventEmitter() as ReturnType<typeof spawn>
  const stdoutStream = new Readable({ read() {} })
  const stderrStream = new Readable({ read() {} })
  ;(proc as unknown as Record<string, unknown>).stdout = stdoutStream
  ;(proc as unknown as Record<string, unknown>).stderr = stderrStream
  ;(proc as unknown as Record<string, unknown>).stdio = [null, stdoutStream, stderrStream]

  setTimeout(() => {
    stdoutStream.push(stdout)
    stdoutStream.push(null)
    stderrStream.push(null)
    proc.emit('close', exitCode)
  }, 0)

  return proc
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getStagedDiff', () => {
  it('returns string output from git diff --staged', async () => {
    const mockDiff = 'diff --git a/file.ts b/file.ts\n+console.log("hello")'
    vi.mocked(spawn).mockReturnValue(createMockProcess(mockDiff))

    const result = await getStagedDiff()
    expect(result).toBe(mockDiff)
    expect(spawn).toHaveBeenCalledWith('git', ['diff', '--staged'], expect.any(Object))
  })

  it('returns empty string when nothing staged', async () => {
    vi.mocked(spawn).mockReturnValue(createMockProcess(''))

    const result = await getStagedDiff()
    expect(result).toBe('')
  })
})

describe('getUnstagedDiff', () => {
  it('returns unstaged diff output', async () => {
    const mockDiff = 'diff --git a/file.ts b/file.ts\n-old\n+new'
    vi.mocked(spawn).mockReturnValue(createMockProcess(mockDiff))

    const result = await getUnstagedDiff()
    expect(result).toBe(mockDiff)
    expect(spawn).toHaveBeenCalledWith('git', ['diff'], expect.any(Object))
  })
})

describe('isGitRepo', () => {
  it('returns true when .git exists', async () => {
    vi.mocked(access).mockResolvedValue(undefined)
    const result = await isGitRepo()
    expect(result).toBe(true)
  })

  it('returns false when .git does not exist', async () => {
    vi.mocked(access).mockRejectedValue(new Error('ENOENT'))
    const result = await isGitRepo()
    expect(result).toBe(false)
  })
})
