# CLAUDE.md — Synkra AIOS HUB

This file extends the global config at `~/.claude/CLAUDE.md` (identity, partner profile, workflow principles).
It provides HUB-specific rules for working inside `D:/workspace/` and its projects.

You are working with Synkra AIOS, an AI-Orchestrated System for Full Stack Development.
AIOS enforcement, agent system, authority matrix, workflows, and commands are defined in global rules (`~/.claude/rules/`) — not duplicated here.

## HUB Structure (IMPORTANT)

Este repositorio e o **HUB** do Synkra AIOS. A estrutura e:

```
D:/workspace/              # HUB (este repositorio)
├── .aios-core/            # Framework AIOS
├── .claude/               # Configuracoes Claude
├── docs/                  # Documentacao do framework
├── squads/                # Templates de agentes
├── workflows/             # Workflows reutilizaveis
└── projects/              # PROJETOS FICAM AQUI
    └── {nome-projeto}/    # Cada projeto em sua pasta
```

### Regra de Projetos
- **SEMPRE** criar novos projetos em `D:/workspace/projects/{nome-projeto}/`
- **NUNCA** criar projetos na raiz do workspace
- Projetos herdam o AIOS do HUB via symlink ou copia

## Constitution (HUB-Specific)

The framework operates under a constitution defined in `.aios-core/constitution.md`:

1. **CLI First** - All functionality MUST work via CLI before any UI
2. **Agent Authority** - Each agent has exclusive authorities (see global rules)
3. **Story-Driven Development** - No code without an associated story in `docs/stories/`
4. **No Invention** - Specs derive from requirements only; no invented features
5. **Quality First** - All code passes lint, typecheck, tests, and build gates

## Development Standards

- **Work from stories** — All development starts with a story in `docs/stories/`
- **Story-driven git** — Every commit references a story: `feat: description [Story X.Y]`
- **Quality gates** — `lint` + `typecheck` + `test` + `build` before push
- **@dev writes, @qa reviews** — @qa never makes direct code edits

## Git & GitHub Integration

### Commit Conventions
- Use conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, etc.
- Reference story ID: `feat: implement login flow [Story 2.1]`
- Keep commits atomic and focused

### Git Delegation
- @dev can: `git add`, `git commit`, `git branch`, `git checkout`, `git stash`, `git diff`
- @devops MUST handle: `git push`, `gh pr create/merge`

---

## Workflow Principles (HUB Context)

- **Simplicity First** — Minimal code impact. No temporary fixes. Senior developer standards.
- **Plan Mode** — Enter plan mode for 3+ step tasks or architectural decisions
- **Subagents** — Use subagents to keep main context clean; one task per subagent
- **Self-Improvement** — After corrections: fix → update `docs/lessons/lessons.md` → evaluate CLAUDE.md
- **Verification** — Never mark done without proving it works. "Would a staff engineer approve this?"

## Standard of Done (HUB)

**Production-ready in this workspace means:**
- Story acceptance criteria fully met
- All quality gates pass: `lint`, `typecheck`, `test`, `build`
- No CRITICAL CodeRabbit issues
- Story checkboxes updated, File List current
- Commit made with story reference

**Does NOT mean:** perfect abstraction, zero tech debt, full documentation. Ship when it solves the problem.

---

## Escalation Triggers (HUB-Specific)

Stop and describe the risk **before** acting:

- **Constitution violation** (code without a story, `git push` outside @devops) → BLOCK, name the violation
- **Story scope creep** (implementing beyond AC) → flag before writing the extra code
- **Data loss risk** (DELETE, DROP, overwrite) → show exactly what will be lost, require explicit confirmation
- **Breaking existing service** (working Docker containers, production DB) → warn before any change
- **Agent authority bypass** (any agent doing what only another agent should) → stop and delegate correctly

---

## Task Management

### NEVER
- Implement without showing options first (1, 2, 3 format)
- Delete or remove content without asking
- Delete anything created in the last 7 days without explicit approval
- Change something that was already working without clear reason
- Mark a task complete without running tests and proving it works
- Process a batch without validating one item first
- Add features that weren't requested
- Use mock data when real data exists in the database
- Explain or justify when receiving criticism — just fix
- Trust subagent output without verification
- Create from scratch when similar exists in `squads/`

### ALWAYS
- Present options as "1. X, 2. Y, 3. Z"
- Check `squads/` and existing components before creating new
- Read the complete schema before proposing database changes
- Investigate root cause when an error persists
- Commit before moving to the next task
- Create handoff in `docs/sessions/YYYY-MM/` at end of session
- After a correction: fix → update `docs/lessons/lessons.md` → evaluate if CLAUDE.md needs a new rule

---
*Synkra AIOS Claude Code Configuration v3.0*
