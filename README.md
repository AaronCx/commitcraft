# CommitCraft

AI-powered conventional commit message generator CLI.

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/aaroncx)

## Install

```bash
npm install -g commitcraft
```

## Setup

Configure your preferred AI provider:

```bash
# Anthropic (default)
commitcraft config set anthropicApiKey YOUR_ANTHROPIC_KEY

# OpenAI
commitcraft config set openaiApiKey YOUR_OPENAI_KEY
commitcraft config set provider openai
```

Or use environment variables:

```bash
export ANTHROPIC_API_KEY=your_key_here
export OPENAI_API_KEY=your_key_here
```

## Usage

### Generate a commit message

```bash
# Stage your changes, then run:
commitcraft generate

# Or use the short alias:
cc gen
```

### Flags

| Flag | Description |
|------|-------------|
| `--provider <name>` | Override provider (`anthropic` or `openai`) |
| `--model <name>` | Override the default model |
| `--copy` | Copy the generated message to clipboard |
| `--commit` | Auto-run `git commit` with the generated message |
| `--dry-run` | Show the diff that would be sent without calling AI |
| `--type <type>` | Constrain commit type (`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`) |
| `--scope <scope>` | Add a conventional commit scope, e.g. `feat(auth): ...` |
| `--emoji` | Prepend a gitmoji to the commit message |
| `--amend` | Regenerate the last commit message |

### Examples

```bash
# Generate and copy to clipboard
commitcraft generate --copy

# Generate and commit directly
commitcraft generate --commit

# Use OpenAI instead of default Anthropic
commitcraft generate --provider openai

# Preview what diff would be sent
commitcraft generate --dry-run

# Force a fix: type message
commitcraft --type fix

# Add scope: feat(auth): ...
commitcraft --scope auth

# Add gitmoji: ✨ feat: ...
commitcraft --emoji

# Redo the last commit message
commitcraft --amend
```

### Init Command

Create a `.commitcraftrc` project config file interactively:

```bash
commitcraft init
```

This walks you through selecting a provider, default commit type, emoji preference, and auto-copy setting.

### Project Configuration

CommitCraft supports a `.commitcraftrc` file in your project root. This JSON file lets you set project-specific defaults that override global config:

```json
{
  "provider": "anthropic",
  "emoji": true,
  "autoCopy": false,
  "defaultType": "feat"
}
```

**Supported keys:** `provider`, `model`, `emoji`, `autoCopy`, `defaultType`

Settings are merged with global config -- project settings take priority.

### Global Configuration

```bash
# Set a config value
commitcraft config set <key> <value>

# Get a config value
commitcraft config get <key>
```

**Config keys:** `provider`, `anthropicApiKey`, `openaiApiKey`, `model`, `autoCopy`, `emoji`, `defaultType`

### Troubleshooting

| Error | Solution |
|-------|----------|
| "Not a git repository" | Run from inside a git project, or run `git init` |
| "No API key found" | Set via `commitcraft config set anthropicApiKey <key>` or `export ANTHROPIC_API_KEY=<key>` |
| "No changes detected" | Stage changes first with `git add <files>` |
| "Network error" | Check your internet connection and try again |
| "Invalid commit type" | Use one of: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build` |

## Supported Providers

| Provider | Default Model | Package |
|----------|--------------|---------|
| **Anthropic** (Claude) | `claude-haiku-4-5` | `@anthropic-ai/sdk` |
| **OpenAI** | `gpt-4o-mini` | `openai` |

## How It Works

1. CommitCraft captures your staged `git diff`
2. The diff is sent to your configured AI provider with a specialized system prompt
3. The AI generates a conventional commit message following the [Conventional Commits](https://www.conventionalcommits.org/) specification
4. The message is validated, displayed, and optionally copied to clipboard or used to commit directly

Diffs are truncated to ~6000 tokens to stay within context limits. API keys are stored securely using XDG-compliant config storage and are never logged or transmitted anywhere except to the configured AI provider.

## Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes and add tests
4. Run `npm test` and `npm run lint`
5. Commit using conventional commits
6. Open a pull request

## Support the Project

CommitCraft is free and open source. If it saves you time, consider buying me a coffee — it helps fund development and keeps the project maintained.

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/aaroncx)

## License

MIT
