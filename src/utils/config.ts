import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import Conf from 'conf'

interface CommitCraftConfig {
  provider: 'anthropic' | 'openai'
  anthropicApiKey: string
  openaiApiKey: string
  model: string
  autoCopy: boolean
  emoji: boolean
  defaultType: string
}

interface ProjectConfig {
  provider?: 'anthropic' | 'openai'
  model?: string
  autoCopy?: boolean
  emoji?: boolean
  defaultType?: string
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
    defaultType: '',
  },
})

export function loadProjectConfig(): ProjectConfig | null {
  const configPath = join(process.cwd(), '.commitcraftrc')
  if (!existsSync(configPath)) {
    return null
  }

  try {
    const raw = readFileSync(configPath, 'utf-8')
    return JSON.parse(raw) as ProjectConfig
  } catch {
    return null
  }
}

export function getConfig(): CommitCraftConfig {
  const global: CommitCraftConfig = {
    provider: config.get('provider'),
    anthropicApiKey: config.get('anthropicApiKey'),
    openaiApiKey: config.get('openaiApiKey'),
    model: config.get('model'),
    autoCopy: config.get('autoCopy'),
    emoji: config.get('emoji'),
    defaultType: config.get('defaultType'),
  }

  const project = loadProjectConfig()
  if (!project) {
    return global
  }

  return {
    ...global,
    ...(project.provider !== undefined && { provider: project.provider }),
    ...(project.model !== undefined && { model: project.model }),
    ...(project.autoCopy !== undefined && { autoCopy: project.autoCopy }),
    ...(project.emoji !== undefined && { emoji: project.emoji }),
    ...(project.defaultType !== undefined && { defaultType: project.defaultType }),
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
