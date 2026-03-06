import OpenAI from 'openai'

const SYSTEM_PROMPT = `You are an expert software engineer. Your job is to write a single conventional commit message based on a git diff provided by the user.

Rules:
- Follow the Conventional Commits spec: type(scope): description
- Types: feat, fix, docs, style, refactor, perf, test, chore, ci, build
- Keep the subject line under 72 characters
- Use imperative mood ("add" not "adds" or "added")
- Do not include a body or footer unless the diff clearly shows a breaking change
- If there is a breaking change, append "!" after the type and add a BREAKING CHANGE footer
- Output ONLY the commit message. No explanation, no markdown, no quotes.`

export async function generateWithOpenAI(
  diff: string,
  apiKey: string,
  model?: string,
): Promise<string> {
  const client = new OpenAI({ apiKey })

  const response = await client.chat.completions.create({
    model: model || 'gpt-4o-mini',
    max_tokens: 256,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Here is the git diff:\n\n${diff}` },
    ],
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('Empty response from OpenAI')
  return content.trim()
}
