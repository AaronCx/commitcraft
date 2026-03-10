import ora from 'ora'
import chalk from 'chalk'
import clipboard from 'clipboardy'
import { confirm } from '@inquirer/prompts'
import { isGitRepo, getStagedDiff, getUnstagedDiff, gitCommit } from '../core/git.js'
import { generateCommitMessage } from '../core/ai.js'
import { validateCommitMessage } from '../core/formatter.js'
import { getConfig, getApiKey } from '../utils/config.js'
import { logger } from '../utils/logger.js'

const VALID_TYPES = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'ci', 'build'] as const

interface GenerateOptions {
  provider?: string
  model?: string
  copy?: boolean
  commit?: boolean
  dryRun?: boolean
  type?: string
}

export async function handleGenerate(options: GenerateOptions) {
  if (options.type && !VALID_TYPES.includes(options.type as typeof VALID_TYPES[number])) {
    logger.error(`Invalid commit type "${options.type}". Valid types: ${VALID_TYPES.join(', ')}`)
    process.exit(1)
  }

  const spinner = ora('Analyzing staged changes...').start()

  try {
    if (!(await isGitRepo())) {
      spinner.stop()
      logger.error('Not a git repository. Run this command from inside a git project.')
      process.exit(1)
    }

    let diff = await getStagedDiff()

    if (!diff) {
      spinner.stop()
      logger.warn('No staged changes found. Checking unstaged changes...')
      diff = await getUnstagedDiff()

      if (!diff) {
        logger.error('No changes found to generate a commit message for.')
        process.exit(1)
      }

      logger.info('Using unstaged changes. Stage them with `git add` before committing.')
    }

    if (options.dryRun) {
      spinner.stop()
      logger.info('Dry run — diff that would be sent to AI:\n')
      console.log(chalk.dim(diff))
      return
    }

    const cfg = getConfig()
    const provider = (options.provider as 'anthropic' | 'openai') || cfg.provider
    const model = options.model || cfg.model || undefined
    const type = options.type
    const apiKey = getApiKey(provider)

    if (!apiKey) {
      spinner.stop()
      logger.error(`No API key configured for ${provider}.`)
      logger.info(`Set it with: commitcraft config set ${provider === 'anthropic' ? 'anthropicApiKey' : 'openaiApiKey'} YOUR_KEY`)
      logger.info('Or set the environment variable: ' + (provider === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY'))
      process.exit(1)
    }

    spinner.text = 'Generating commit message...'

    const message = await generateCommitMessage(diff, { provider, model, apiKey, type })

    spinner.stop()

    if (!validateCommitMessage(message)) {
      logger.warn('Generated message may not follow conventional commit format.')
    }

    logger.success('Commit message generated\n')
    console.log(chalk.bold(message))
    console.log()
    console.log(chalk.dim('──────────────────────────────────────'))
    console.log(chalk.yellow('💛 If commitcraft saves you time, consider supporting it:'))
    console.log(chalk.yellow('   https://ko-fi.com/aaroncx'))
    console.log(chalk.dim('──────────────────────────────────────'))

    const shouldCopy = options.copy || cfg.autoCopy
    if (shouldCopy) {
      await clipboard.write(message)
      logger.success('Copied to clipboard!')
    }

    if (options.commit) {
      const ok = await confirm({ message: `Commit with: "${message}"?`, default: false })
      if (ok) {
        await gitCommit(message)
        logger.success('Committed!')
      } else {
        logger.info('Commit cancelled.')
      }
    }
  } catch (err) {
    spinner.stop()
    const msg = err instanceof Error ? err.message : String(err)
    logger.error(msg)
    process.exit(1)
  }
}
