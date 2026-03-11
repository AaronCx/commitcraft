import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `You are an expert software engineer. Your job is to write a single conventional commit message based on a git diff provided by the user.

Rules:
- Follow the Conventional Commits spec: type(scope): description
- Types: feat, fix, docs, style, refactor, perf, test, chore, ci, build
- Keep the subject line under 72 characters
- Use imperative mood ("add" not "adds" or "added")
- Do not include a body or footer unless the diff clearly shows a breaking change
- If there is a breaking change, append "!" after the type and add a BREAKING CHANGE footer
- Output ONLY the commit message. No explanation, no markdown, no quotes.`

export async function generateWithAnthropic(
  diff: string,
  apiKey: string,
  model?: string,
  type?: string,
  scope?: string,
): Promise<string> {
  const client = new Anthropic({ apiKey })

  let systemPrompt = SYSTEM_PROMPT
  if (type) {
    systemPrompt += `\n\nIMPORTANT: The commit MUST use the type: ${type}`
  }
  if (scope) {
    systemPrompt += `\n\nIMPORTANT: The commit MUST include the scope "${scope}", e.g. type(${scope}): description`
  }

  const response = await client.messages.create({
    model: model || 'claude-haiku-4-5-20241022',
    max_tokens: 256,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Here is the git diff:\n\n${diff}`,
      },
    ],
  })

  const block = response.content[0]
  if (block.type === 'text') {
    return block.text.trim()
  }
  throw new Error('Unexpected response format from Anthropic')
}
