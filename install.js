#!/usr/bin/env node
/**
 * Lovable Claude Plugin — installer
 *
 * Usage:
 *   node install.js                          interactive menu
 *   node install.js --global                 install to ~/.claude/
 *   node install.js --project                install to ./.claude/
 *   node install.js --uninstall --global     remove from ~/.claude/
 *   node install.js --uninstall --project    remove from ./.claude/
 *   Add --force to any uninstall to skip the confirmation prompt.
 */

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { homedir } from 'os'
import { fileURLToPath } from 'url'
import { createInterface } from 'readline'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'))

// ── Helpers ───────────────────────────────────────────────────────────────────

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true })
}

function copyDir(src, dest) {
  ensureDir(dest)
  cpSync(src, dest, { recursive: true, force: true })
}

function removeIfExists(absPath, label) {
  if (existsSync(absPath)) {
    rmSync(absPath, { recursive: true, force: true })
    console.log(`  ✓  Removed   ${label}`)
  } else {
    console.log(`  ℹ  Not found — skipped  ${label}`)
  }
}

function mergeSettings(destPath, additions) {
  let existing = {}
  if (existsSync(destPath)) {
    try {
      existing = JSON.parse(readFileSync(destPath, 'utf8'))
    } catch {
      console.warn(`  ⚠  Could not parse ${destPath} — will overwrite with plugin settings`)
    }
  }

  const existingAllow = existing?.permissions?.allow ?? []
  const newAllow = additions?.permissions?.allow ?? []
  const mergedAllow = [...new Set([...existingAllow, ...newAllow])]

  const mergedHooks = { ...(existing?.hooks ?? {}) }
  for (const [event, entries] of Object.entries(additions?.hooks ?? {})) {
    const current = mergedHooks[event] ?? []
    const toAdd = entries.filter(
      (e) => !current.some((c) => JSON.stringify(c) === JSON.stringify(e))
    )
    mergedHooks[event] = [...current, ...toAdd]
  }

  writeFileSync(
    destPath,
    JSON.stringify(
      { ...existing, permissions: { ...(existing.permissions ?? {}), allow: mergedAllow }, hooks: mergedHooks },
      null, 2
    ) + '\n',
    'utf8'
  )
}

function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (answer) => { rl.close(); resolve(answer.trim()) })
  })
}

async function confirm(paths, force) {
  if (force) return true
  console.log('This will remove:\n')
  paths.forEach((p) => console.log(`  ${p}`))
  console.log()
  const answer = await prompt('Proceed? (y/N): ')
  return answer.toLowerCase() === 'y'
}

// ── Install ───────────────────────────────────────────────────────────────────

function installGlobal() {
  const dest = join(homedir(), '.claude')

  copyDir(join(__dirname, '.claude', 'commands'), join(dest, 'commands', 'lovable'))
  console.log(`  ✓  Commands  →  ~/.claude/commands/lovable/`)

  copyDir(join(__dirname, '.claude', 'rules'), join(dest, 'lovable', 'rules'))
  console.log(`  ✓  Rules     →  ~/.claude/lovable/rules/`)

  const additions = JSON.parse(readFileSync(join(__dirname, '.claude', 'settings.json'), 'utf8'))
  mergeSettings(join(dest, 'settings.json'), additions)
  console.log(`  ✓  Settings  →  ~/.claude/settings.json  (merged)`)

  console.log(`\n  Commands available in every project as /lovable:scaffold, /lovable:component, etc.`)
}

function installProject() {
  const dest = join(process.cwd(), '.claude')

  if (join(__dirname, '.claude', 'commands') === join(dest, 'commands')) {
    console.error(
      '  ✗  Cannot project-install into the plugin directory itself.\n' +
      '     cd into your target project first, then run:\n' +
      `     node ${join(__dirname, 'install.js')} --project`
    )
    process.exit(1)
  }

  copyDir(join(__dirname, '.claude', 'commands'), join(dest, 'commands'))
  console.log(`  ✓  Commands  →  .claude/commands/`)

  copyDir(join(__dirname, '.claude', 'rules'), join(dest, 'rules'))
  console.log(`  ✓  Rules     →  .claude/rules/`)

  const additions = JSON.parse(readFileSync(join(__dirname, '.claude', 'settings.json'), 'utf8'))
  mergeSettings(join(dest, 'settings.json'), additions)
  console.log(`  ✓  Settings  →  .claude/settings.json  (merged)`)

  const claudeMdPath = join(process.cwd(), 'CLAUDE.md')
  if (!existsSync(claudeMdPath)) {
    writeFileSync(claudeMdPath, readFileSync(join(__dirname, 'CLAUDE.md'), 'utf8'), 'utf8')
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

async function uninstallGlobal(force) {
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
  console.log('  Run node install.js --global to reinstall.')
}

async function uninstallProject(force) {
  const base = join(process.cwd(), '.claude')
  const paths = [
    { abs: join(base, 'commands'),    label: '.claude/commands/' },
    { abs: join(base, 'rules'),       label: '.claude/rules/' },
    { abs: join(base, 'settings.json'), label: '.claude/settings.json' },
  ]

  const ok = await confirm(paths.map((p) => p.label), force)
  if (!ok) { console.log('\n  Aborted.'); return }

  console.log()
  paths.forEach(({ abs, label }) => removeIfExists(abs, label))
  console.log('\n  CLAUDE.md was left untouched (may contain your edits).')
  console.log('  Run node install.js --project to reinstall.')
}

// ── Entry point ───────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nLovable Claude Plugin  v${pkg.version}\n`)

  const args = process.argv.slice(2)
  const isUninstall = args.includes('--uninstall')
  const isGlobal    = args.includes('--global')
  const isProject   = args.includes('--project')
  const force       = args.includes('--force')

  // Non-interactive path
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
      console.error('\nFailed:', err.message)
      process.exit(1)
    }
    return
  }

  // Bare --uninstall with no scope → error
  if (isUninstall) {
    console.error('  ✗  Specify a scope:  --uninstall --global   or   --uninstall --project\n')
    process.exit(1)
  }

  // Interactive menu
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
    console.error('\nFailed:', err.message)
    process.exit(1)
  }
}

main()
