const CONVENTIONAL_COMMIT_RE =
  /^(feat|fix|docs|style|refactor|perf|test|chore|ci|build)(\(.+\))?!?:\s.+$/

export function validateCommitMessage(msg: string): boolean {
  const firstLine = msg.split('\n')[0]
  if (firstLine.length > 72) return false
  return CONVENTIONAL_COMMIT_RE.test(firstLine)
}
