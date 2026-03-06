import { getConfig, setConfig } from '../utils/config.js'
import { logger } from '../utils/logger.js'

export function handleConfigSet(key: string, value: string) {
  const validKeys = ['provider', 'anthropicApiKey', 'openaiApiKey', 'model', 'autoCopy']
  if (!validKeys.includes(key)) {
    logger.error(`Invalid config key: ${key}`)
    logger.info(`Valid keys: ${validKeys.join(', ')}`)
    process.exit(1)
  }

  if (key === 'provider' && value !== 'anthropic' && value !== 'openai') {
    logger.error('Provider must be "anthropic" or "openai"')
    process.exit(1)
  }

  setConfig(key, value)
  const displayValue = key.includes('ApiKey') ? value.slice(0, 8) + '...' : value
  logger.success(`Set ${key} = ${displayValue}`)
}

export function handleConfigGet(key: string) {
  const cfg = getConfig()
  const value = cfg[key as keyof typeof cfg]

  if (value === undefined) {
    logger.error(`Unknown config key: ${key}`)
    process.exit(1)
  }

  const displayValue =
    typeof value === 'string' && key.includes('ApiKey') && value.length > 8
      ? value.slice(0, 8) + '...'
      : String(value)

  console.log(displayValue || '(not set)')
}
