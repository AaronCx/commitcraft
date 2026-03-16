import ora from 'ora'
import chalk from 'chalk'
import clipboard from 'clipboardy'
import { confirm, select, input } from '@inquirer/prompts'
import { isGitRepo, getStagedDiff, getUnstagedDiff, gitCommit, getLastCommitMessage, gitAmend } from '../core/git.js'
import { generateCommitMessage } from '../core/ai.js'
import { validateCommitMessage } from '../core/formatter.js'
import { getConfig, getApiKey } from '../utils/config.js'
import { logger } from '../utils/logger.js'
import { prependEmoji } from '../utils/emoji.js'

const VALID_TYPES = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'ci', 'build'] as const

interface GenerateOptions {
  provider?: string
  model?: string
  copy?: boolean
  commit?: boolean
  dryRun?: boolean
  type?: string
  scope?: string
  emoji?: boolean
  amend?: boolean
  interactive?: boolean
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
      logger.error('Not a git repository.\n')
      logger.info('Run this command from inside a git project, or initialize one:')
      logger.dim('  git init')
      process.exit(1)
    }

    const cfg = getConfig()
    const provider = (options.provider as 'anthropic' | 'openai') || cfg.provider
    const model = options.model || cfg.model || undefined
    const type = options.type || cfg.defaultType || undefined
    const scope = options.scope
    const apiKey = getApiKey(provider)

    if (!apiKey) {
      spinner.stop()
      const keyFlag = provider === 'anthropic' ? 'anthropicApiKey' : 'openaiApiKey'
      const envVar = provider === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY'
      logger.error(`No API key found for ${provider}.\n`)
      logger.info('Set it with:')
      logger.dim(`  commitcraft config set ${keyFlag} <your-key>`)
      logger.info('Or set the environment variable:')
      logger.dim(`  export ${envVar}=<your-key>`)
      process.exit(1)
    }

    if (options.amend) {
      spinner.text = 'Reading last commit...'
      const lastMsg = await getLastCommitMessage()
      logger.info(`Current message: "${lastMsg}"`)

      spinner.text = 'Getting diff from last commit...'
      const diff = await getStagedDiff() || (await getUnstagedDiff())
      const amendDiff = diff || lastMsg

      spinner.text = 'Generating new commit message...'
      let message = await generateCommitMessage(amendDiff, { provider, model, apiKey, type, scope })

      if (options.emoji || cfg.emoji) {
        message = prependEmoji(message)
      }

      spinner.stop()

      logger.success('New commit message generated\n')
      console.log(chalk.bold(message))

      const ok = await confirm({ message: `Amend last commit with: "${message}"?`, default: false })
      if (ok) {
        await gitAmend(message)
        logger.success('Commit amended!')
      } else {
        logger.info('Amend cancelled.')
      }
      return
    }

    let diff = await getStagedDiff()

    if (!diff) {
      spinner.stop()
      logger.warn('No staged changes found. Checking unstaged changes...')
      diff = await getUnstagedDiff()

      if (!diff) {
        logger.error('No changes detected.\n')
        logger.info('Stage your changes first:')
        logger.dim('  git add <files>')
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

    spinner.text = 'Generating commit message...'

    let message: string
    try {
      message = await generateCommitMessage(diff, { provider, model, apiKey, type, scope })
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      const isNetworkError =
        errMsg.includes('fetch') ||
        errMsg.includes('ENOTFOUND') ||
        errMsg.includes('ECONNREFUSED') ||
        errMsg.includes('ETIMEDOUT') ||
        errMsg.includes('network') ||
        errMsg.includes('socket') ||
        errMsg.includes('ECONNRESET')
      if (isNetworkError) {
        spinner.stop()
        logger.error(`Network error — could not reach ${provider} API.\n`)
        logger.info('Check your internet connection and try again.')
        process.exit(1)
      }
      throw err
    }

    if (options.emoji || cfg.emoji) {
      message = prependEmoji(message)
    }

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
      const useInteractive = options.interactive !== false
      if (useInteractive) {
        message = await interactiveLoop(message, diff, { provider, model, apiKey, type, scope }, options.emoji || cfg.emoji)
      }
      const ok = await confirm({ message: `Commit with: "${message}"?`, default: true })
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

async function interactiveLoop(
  message: string,
  diff: string,
  aiOpts: { provider: 'anthropic' | 'openai'; model?: string; apiKey: string; type?: string; scope?: string },
  useEmoji: boolean,
): Promise<string> {
  let current = message

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const action = await select({
      message: 'What would you like to do?',
      choices: [
        { name: 'Accept this message', value: 'accept' },
        { name: 'Edit the message', value: 'edit' },
        { name: 'Regenerate a new message', value: 'regenerate' },
      ],
    })

    if (action === 'accept') {
      return current
    }

    if (action === 'edit') {
      const edited = await input({
        message: 'Edit commit message:',
        default: current,
      })
      current = edited
      console.log()
      console.log(chalk.bold(current))
      continue
    }

    if (action === 'regenerate') {
      const spinner = ora('Regenerating commit message...').start()
      let newMessage = await generateCommitMessage(diff, aiOpts)
      if (useEmoji) {
        newMessage = prependEmoji(newMessage)
      }
      spinner.stop()
      current = newMessage
      logger.success('New message generated\n')
      console.log(chalk.bold(current))
    }
  }
}
