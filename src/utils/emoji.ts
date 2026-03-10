const GITMOJI_MAP: Record<string, string> = {
  feat: '✨',
  fix: '🐛',
  docs: '📝',
  style: '💄',
  refactor: '♻️',
  perf: '⚡',
  test: '✅',
  chore: '🔧',
  ci: '👷',
  build: '📦',
}

export function prependEmoji(message: string): string {
  // Extract the type from the conventional commit message
  const match = message.match(/^(feat|fix|docs|style|refactor|perf|test|chore|ci|build)/)
  if (match && GITMOJI_MAP[match[1]]) {
    return `${GITMOJI_MAP[match[1]]} ${message}`
  }
  return message
}
