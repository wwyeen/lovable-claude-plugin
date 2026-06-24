import { describe, it, expect } from 'vitest'
import { mergeSettingsData } from '../install.js'

describe('mergeSettingsData', () => {
  it('merges permissions.allow arrays and deduplicates', () => {
    const existing = { permissions: { allow: ['Bash(git status)', 'Bash(npm run dev)'] } }
    const additions = { permissions: { allow: ['Bash(npm run dev)', 'Bash(npx shadcn@latest add *)'] } }
    const result = mergeSettingsData(existing, additions)
    expect(result.permissions?.allow).toEqual([
      'Bash(git status)',
      'Bash(npm run dev)',
      'Bash(npx shadcn@latest add *)',
    ])
  })

  it('handles empty existing settings', () => {
    const additions = { permissions: { allow: ['Bash(git status)'] } }
    const result = mergeSettingsData({}, additions)
    expect(result.permissions?.allow).toEqual(['Bash(git status)'])
  })

  it('handles empty additions', () => {
    const existing = { permissions: { allow: ['Bash(git status)'] } }
    const result = mergeSettingsData(existing, {})
    expect(result.permissions?.allow).toEqual(['Bash(git status)'])
  })

  it('handles both empty', () => {
    const result = mergeSettingsData({}, {})
    expect(result.permissions?.allow).toEqual([])
  })

  it('merges hooks without duplicating identical entries', () => {
    const hook = { type: 'command', command: 'npm run lint' }
    const existing = { hooks: { PostToolUse: [{ matcher: 'Write', hooks: [hook] }] } }
    const additions = { hooks: { PostToolUse: [{ matcher: 'Write', hooks: [hook] }] } }
    const result = mergeSettingsData(existing, additions)
    expect(result.hooks?.PostToolUse).toHaveLength(1)
  })

  it('adds new hook events from additions', () => {
    const existing = {
      hooks: { PostToolUse: [{ hooks: [{ type: 'command', command: 'lint' }] }] },
    }
    const additions = {
      hooks: { Stop: [{ hooks: [{ type: 'command', command: 'typecheck' }] }] },
    }
    const result = mergeSettingsData(existing, additions)
    expect(result.hooks?.PostToolUse).toHaveLength(1)
    expect(result.hooks?.Stop).toHaveLength(1)
  })

  it('preserves existing top-level properties', () => {
    const existing = { customProp: 'value', permissions: { allow: [] } }
    const additions = { permissions: { allow: ['Bash(git status)'] } }
    const result = mergeSettingsData(existing, additions)
    expect(result.customProp).toBe('value')
  })

  it('preserves existing permissions properties beyond allow', () => {
    const existing = { permissions: { allow: [], deny: ['Bash(rm *)'] } }
    const additions = { permissions: { allow: ['Bash(git status)'] } }
    const result = mergeSettingsData(existing, additions)
    expect(result.permissions?.deny).toEqual(['Bash(rm *)'])
  })
})
