import { spawn } from 'child_process'
import { access } from 'fs/promises'
import { join } from 'path'
import { logger } from '../utils/logger.js'

function runGit(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn('git', args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (data: Buffer) => {
      stdout += data.toString()
    })
    proc.stderr.on('data', (data: Buffer) => {
      stderr += data.toString()
    })
    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `git exited with code ${code}`))
      } else {
        resolve(stdout)
      }
    })
    proc.on('error', reject)
  })
}

const MAX_CHARS = 24000

function truncateDiff(diff: string): string {
  if (diff.length > MAX_CHARS) {
    logger.warn(`Diff truncated from ${diff.length} to ${MAX_CHARS} characters (~6000 tokens)`)
    return diff.slice(0, MAX_CHARS)
  }
  return diff
}

export async function isGitRepo(): Promise<boolean> {
  try {
    await access(join(process.cwd(), '.git'))
    return true
  } catch {
    return false
  }
}

export async function getStagedDiff(): Promise<string> {
  const diff = await runGit(['diff', '--staged'])
  return truncateDiff(diff)
}

export async function getUnstagedDiff(): Promise<string> {
  const diff = await runGit(['diff'])
  return truncateDiff(diff)
}

export async function gitCommit(message: string): Promise<string> {
  return runGit(['commit', '-m', message])
}
