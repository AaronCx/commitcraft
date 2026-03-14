# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.1.0] - 2026-03-16

### Added
- `--type` flag to constrain commit message type
- `--scope` flag for conventional commit scopes
- `--emoji` flag to prepend gitmoji
- `--amend` flag to regenerate last commit message
- `commitcraft init` command for project configuration
- `.commitcraftrc` project config file support
- Better error handling with helpful messages
- Unit tests for CLI flags, config, emoji, and error paths
- GitHub Actions CI workflow

### Changed
- Config system now merges project and global settings

## [1.0.0] - 2026-03-06

### Added
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
