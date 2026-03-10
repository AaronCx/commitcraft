import Conf from 'conf'

interface CommitCraftConfig {
  provider: 'anthropic' | 'openai'
  anthropicApiKey: string
  openaiApiKey: string
  model: string
  autoCopy: boolean
  emoji: boolean
}

const config = new Conf<CommitCraftConfig>({
  projectName: 'commitcraft',
  defaults: {
    provider: 'anthropic',
    anthropicApiKey: '',
    openaiApiKey: '',
    model: '',
    autoCopy: false,
    emoji: false,
  },
})

export function getConfig(): CommitCraftConfig {
  return {
    provider: config.get('provider'),
    anthropicApiKey: config.get('anthropicApiKey'),
    openaiApiKey: config.get('openaiApiKey'),
    model: config.get('model'),
    autoCopy: config.get('autoCopy'),
    emoji: config.get('emoji'),
  }
}

export function setConfig(key: string, value: string) {
  if (key === 'autoCopy' || key === 'emoji') {
    config.set(key, value === 'true')
  } else {
    config.set(key as keyof CommitCraftConfig, value)
  }
}

export function getApiKey(provider: 'anthropic' | 'openai'): string {
  const envKey =
    provider === 'anthropic'
      ? process.env.ANTHROPIC_API_KEY
      : process.env.OPENAI_API_KEY

  if (envKey) return envKey

  return provider === 'anthropic'
    ? config.get('anthropicApiKey')
    : config.get('openaiApiKey')
}
