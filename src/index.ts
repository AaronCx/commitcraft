import { Command } from 'commander'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { handleGenerate } from './commands/generate.js'
import { handleConfigSet, handleConfigGet } from './commands/config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function getVersion(): string {
  try {
    const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'))
    return pkg.version
  } catch {
    return '1.0.0'
  }
}

const program = new Command()

program
  .name('commitcraft')
  .description(
    'AI-powered conventional commit message generator\n\n💛 Support the project: https://ko-fi.com/aaroncx',
  )
  .version(getVersion(), '-v, --version')

program
  .command('generate', { isDefault: true })
  .alias('gen')
  .description('Generate a commit message from staged changes')
  .option('--provider <name>', 'AI provider (anthropic | openai)')
  .option('--model <name>', 'Override model')
  .option('--copy', 'Copy result to clipboard')
  .option('--commit', 'Auto-run git commit with the result')
  .option('--dry-run', 'Show the diff without calling AI')
  .option('--type <type>', 'Constrain commit type (feat, fix, docs, style, refactor, perf, test, chore, ci, build)')
  .action(handleGenerate)

const configCmd = program.command('config').description('Manage configuration')

configCmd
  .command('set <key> <value>')
  .description('Set a config value')
  .action(handleConfigSet)

configCmd
  .command('get <key>')
  .description('Get a config value')
  .action(handleConfigGet)

program.parse()
