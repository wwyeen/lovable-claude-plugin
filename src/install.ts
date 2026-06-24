#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { homedir } from 'os'
import { fileURLToPath } from 'url'
import { createInterface } from 'readline'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
// dist/install.js lives one level below the project root
const PLUGIN_ROOT = join(__dirname, '..')

interface HookCommand {
  type: string
  command: string
}

interface HookEntry {
  matcher?: string
  hooks: HookCommand[]
}

export interface Settings {
  permissions?: {
    allow?: string[]
    [key: string]: unknown
  }
  hooks?: Record<string, HookEntry[]>
  [key: string]: unknown
}

interface Package {
  version: string
  [key: string]: unknown
}

const pkg = JSON.parse(readFileSync(join(PLUGIN_ROOT, 'package.json'), 'utf8')) as Package

// ── Helpers ───────────────────────────────────────────────────────────────────

function ensureDir(dir: string): void {
  mkdirSync(dir, { recursive: true })
}

function copyDir(src: string, dest: string): void {
  ensureDir(dest)
  cpSync(src, dest, { recursive: true, force: true })
}

function removeIfExists(absPath: string, label: string): void {
  if (existsSync(absPath)) {
    rmSync(absPath, { recursive: true, force: true })
    console.log(`  ✓  Removed   ${label}`)
  } else {
    console.log(`  ℹ  Not found — skipped  ${label}`)
  }
}

export function mergeSettingsData(existing: Settings, additions: Settings): Settings {
  const existingAllow = existing?.permissions?.allow ?? []
  const newAllow = additions?.permissions?.allow ?? []
  const mergedAllow = [...new Set([...existingAllow, ...newAllow])]

  const mergedHooks: Record<string, HookEntry[]> = { ...(existing?.hooks ?? {}) }
  for (const [event, entries] of Object.entries(additions?.hooks ?? {})) {
    const current = mergedHooks[event] ?? []
    const toAdd = entries.filter(
      (e) => !current.some((c) => JSON.stringify(c) === JSON.stringify(e))
    )
    mergedHooks[event] = [...current, ...toAdd]
  }

  return {
    ...existing,
    permissions: { ...(existing.permissions ?? {}), allow: mergedAllow },
    hooks: mergedHooks,
  }
}

function mergeSettings(destPath: string, additions: Settings): void {
  let existing: Settings = {}
  if (existsSync(destPath)) {
    try {
      existing = JSON.parse(readFileSync(destPath, 'utf8')) as Settings
    } catch {
      console.warn(`  ⚠  Could not parse ${destPath} — will overwrite with plugin settings`)
    }
  }
  const merged = mergeSettingsData(existing, additions)
  writeFileSync(destPath, JSON.stringify(merged, null, 2) + '\n', 'utf8')
}

function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

async function confirm(paths: string[], force: boolean): Promise<boolean> {
  if (force) return true
  console.log('This will remove:\n')
  paths.forEach((p) => console.log(`  ${p}`))
  console.log()
  const answer = await prompt('Proceed? (y/N): ')
  return answer.toLowerCase() === 'y'
}

// ── Install ───────────────────────────────────────────────────────────────────

function installGlobal(): void {
  const dest = join(homedir(), '.claude')

  copyDir(join(PLUGIN_ROOT, '.claude', 'commands'), join(dest, 'commands', 'lovable'))
  console.log(`  ✓  Commands  →  ~/.claude/commands/lovable/`)

  copyDir(join(PLUGIN_ROOT, '.claude', 'rules'), join(dest, 'lovable', 'rules'))
  console.log(`  ✓  Rules     →  ~/.claude/lovable/rules/`)

  const additions = JSON.parse(
    readFileSync(join(PLUGIN_ROOT, '.claude', 'settings.json'), 'utf8')
  ) as Settings
  mergeSettings(join(dest, 'settings.json'), additions)
  console.log(`  ✓  Settings  →  ~/.claude/settings.json  (merged)`)

  console.log(`\n  Commands available in every project as /lovable:scaffold, /lovable:component, etc.`)
}

function installProject(): void {
  const dest = join(process.cwd(), '.claude')

  if (join(PLUGIN_ROOT, '.claude', 'commands') === join(dest, 'commands')) {
    console.error(
      '  ✗  Cannot project-install into the plugin directory itself.\n' +
      '     cd into your target project first, then run:\n' +
      `     node ${join(PLUGIN_ROOT, 'dist', 'install.js')} --project`
    )
    process.exit(1)
  }

  copyDir(join(PLUGIN_ROOT, '.claude', 'commands'), join(dest, 'commands'))
  console.log(`  ✓  Commands  →  .claude/commands/`)

  copyDir(join(PLUGIN_ROOT, '.claude', 'rules'), join(dest, 'rules'))
  console.log(`  ✓  Rules     →  .claude/rules/`)

  const additions = JSON.parse(
    readFileSync(join(PLUGIN_ROOT, '.claude', 'settings.json'), 'utf8')
  ) as Settings
  mergeSettings(join(dest, 'settings.json'), additions)
  console.log(`  ✓  Settings  →  .claude/settings.json  (merged)`)

  const claudeMdPath = join(process.cwd(), 'CLAUDE.md')
  if (!existsSync(claudeMdPath)) {
    writeFileSync(claudeMdPath, readFileSync(join(PLUGIN_ROOT, 'CLAUDE.md'), 'utf8'), 'utf8')
    console.log(`  ✓  CLAUDE.md →  ./CLAUDE.md`)
  } else {
    console.log(`  ℹ  CLAUDE.md already exists — skipped`)
  }

  console.log(`
  Commit .claude/ and CLAUDE.md to git so your whole team gets the plugin
  automatically when they clone the repo.

  Suggested:
    git add .claude CLAUDE.md
    git commit -m "chore: add lovable claude plugin"`)
}

// ── Uninstall ─────────────────────────────────────────────────────────────────

async function uninstallGlobal(force: boolean): Promise<void> {
  const base = join(homedir(), '.claude')
  const paths = [
    { abs: join(base, 'commands', 'lovable'), label: '~/.claude/commands/lovable/' },
    { abs: join(base, 'lovable'),             label: '~/.claude/lovable/' },
  ]

  const ok = await confirm(paths.map((p) => p.label), force)
  if (!ok) { console.log('\n  Aborted.'); return }

  console.log()
  paths.forEach(({ abs, label }) => removeIfExists(abs, label))
  console.log('\n  ~/.claude/settings.json was left untouched.')
  console.log('  Run node dist/install.js --global to reinstall.')
}

async function uninstallProject(force: boolean): Promise<void> {
  const base = join(process.cwd(), '.claude')
  const paths = [
    { abs: join(base, 'commands'),       label: '.claude/commands/' },
    { abs: join(base, 'rules'),          label: '.claude/rules/' },
    { abs: join(base, 'settings.json'),  label: '.claude/settings.json' },
  ]

  const ok = await confirm(paths.map((p) => p.label), force)
  if (!ok) { console.log('\n  Aborted.'); return }

  console.log()
  paths.forEach(({ abs, label }) => removeIfExists(abs, label))
  console.log('\n  CLAUDE.md was left untouched (may contain your edits).')
  console.log('  Run node dist/install.js --project to reinstall.')
}

// ── Entry point ───────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log(`\nLovable Claude Plugin  v${pkg.version}\n`)

  const args = process.argv.slice(2)
  const isUninstall = args.includes('--uninstall')
  const isGlobal    = args.includes('--global')
  const isProject   = args.includes('--project')
  const force       = args.includes('--force')

  if (isGlobal || isProject) {
    console.log()
    try {
      if (isUninstall) {
        if (isGlobal) await uninstallGlobal(force)
        else          await uninstallProject(force)
      } else {
        if (isGlobal) installGlobal()
        else          installProject()
      }
      console.log('\n  Done.\n')
    } catch (err) {
      console.error('\nFailed:', (err as Error).message)
      process.exit(1)
    }
    return
  }

  if (isUninstall) {
    console.error('  ✗  Specify a scope:  --uninstall --global   or   --uninstall --project\n')
    process.exit(1)
  }

  console.log('What would you like to do?\n')
  console.log('  1.  Install   global   — ~/.claude/commands/lovable/  (/lovable:scaffold, etc.)')
  console.log('                           Works in every project on this machine\n')
  console.log('  2.  Install   project  — ./.claude/commands/  (/scaffold, etc.)')
  console.log('                           Scoped to current directory; check into git\n')
  console.log('  3.  Uninstall global   — remove ~/.claude/commands/lovable/ and ~/.claude/lovable/\n')
  console.log('  4.  Uninstall project  — remove .claude/commands/, .claude/rules/, .claude/settings.json\n')

  const answer = await prompt('Enter 1, 2, 3, or 4: ')
  console.log()

  try {
    if      (answer === '1') installGlobal()
    else if (answer === '2') installProject()
    else if (answer === '3') await uninstallGlobal(false)
    else if (answer === '4') await uninstallProject(false)
    else {
      console.error('  Invalid choice. Run again and enter 1, 2, 3, or 4.')
      process.exit(1)
    }
    console.log('\n  Done.\n')
  } catch (err) {
    console.error('\nFailed:', (err as Error).message)
    process.exit(1)
  }
}

main()
