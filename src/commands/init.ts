import { writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { select, confirm } from '@inquirer/prompts'
import { logger } from '../utils/logger.js'

const CONFIG_FILENAME = '.commitcraftrc'

const COMMIT_TYPES = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'ci', 'build'] as const

export async function initConfig() {
  const configPath = join(process.cwd(), CONFIG_FILENAME)

  if (existsSync(configPath)) {
    const overwrite = await confirm({
      message: `${CONFIG_FILENAME} already exists. Overwrite?`,
      default: false,
    })
    if (!overwrite) {
      logger.info('Cancelled.')
      return
    }
  }

  const provider = await select({
    message: 'Preferred AI provider:',
    choices: [
      { name: 'Anthropic (Claude)', value: 'anthropic' },
      { name: 'OpenAI (GPT)', value: 'openai' },
    ],
  })

  const defaultType = await select({
    message: 'Default commit type:',
    choices: [
      { name: 'None (let AI decide)', value: '' },
      ...COMMIT_TYPES.map((t) => ({ name: t, value: t })),
    ],
  })

  const emoji = await confirm({
    message: 'Enable emoji in commit messages by default?',
    default: false,
  })

  const autoCopy = await confirm({
    message: 'Auto-copy generated message to clipboard?',
    default: false,
  })

  const config: Record<string, unknown> = {
    provider,
    emoji,
    autoCopy,
  }

  if (defaultType) {
    config.defaultType = defaultType
  }

  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8')
  logger.success(`Created ${CONFIG_FILENAME}`)
}
