# Hub Switch Project Task

**Task ID:** hub-switch-project
**Agent:** @aios-master
**Command:** `*switch-project {nome}`

---

## Purpose

Switch context to a specific project, loading its configuration and status.

---

## Execution Steps

### 1. Validate Project Name

- Required argument: project name
- Must exist in registry

### 2. Check Project Exists

- Look up project in hub-context.json
- Fall back to entity-registry.yaml

### 3. Update Session State

Create/update `.aios/session-state.json`:

```json
{
  "version": "1.0",
  "hubRoot": "...",
  "currentContext": "project",
  "currentProject": "project-name",
  "switchedAt": "ISO-timestamp",
  "history": [...]
}
```

### 4. Display Project Greeting

```
👑 AIOS Master — Projeto: projeto-alpha
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Status: active
🎯 Epic ativo: 1 - Foundation
📋 Story ativa: 1.2 - Sync Projects

Comandos: *hub (voltar ao Hub) | *help
```

---

## Output Examples

### Success
```
👑 AIOS Master — Projeto: projeto-alpha
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Status: active

Comandos: *hub (voltar ao Hub) | *help
```

### Error - Project Not Found
```
❌ Project "nonexistent" not found.
   Use *list-projects to see available projects.
```

---

## Implementation

Script: `.aios-core/scripts/hub-switch-project.js`

---

## Related Commands

- `*hub` - Return to Hub context
- `*list-projects` - List available projects

---

## Change Log

| Date | Version | Description |
|------|---------|-------------|
| 2026-02-19 | 1.0 | Initial implementation |
