# Changelog

## v1.0.0 (2026-03-06)

### Features
- AI-powered commit message generation from git diffs
- Anthropic Claude and OpenAI provider support
- Conventional Commits format validation
- `--copy` flag to copy message to clipboard
- `--commit` flag to auto-commit with confirmation
- `--dry-run` flag to preview diff without calling AI
- `--provider` and `--model` flags for runtime overrides
- XDG-compliant persistent configuration via `commitcraft config`
- Diff truncation to stay within AI context limits
- Friendly error messages for auth, rate limits, and git issues
