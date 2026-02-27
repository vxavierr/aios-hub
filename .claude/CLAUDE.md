# CLAUDE.md — Synkra AIOS HUB

This file extends the global config at `~/.claude/CLAUDE.md` (identity, partner profile, workflow principles).
It provides HUB-specific rules for working inside `D:/workspace/` and its projects.

You are working with Synkra AIOS, an AI-Orchestrated System for Full Stack Development.

<!-- AIOS-MANAGED-START: hub-structure -->
## HUB Structure (IMPORTANT)

Este repositório é o **HUB** do Synkra AIOS. A estrutura é:

```
D:/workspace/              # HUB (este repositório)
├── .aios-core/            # Framework AIOS
├── .claude/               # Configurações Claude
├── docs/                  # Documentação do framework
├── squads/                # Templates de agentes
├── workflows/             # Workflows reutilizáveis
└── projects/              # PROJETOS FICAM AQUI
    └── {nome-projeto}/    # Cada projeto em sua pasta
```

### Regra de Projetos
- **SEMPRE** criar novos projetos em `D:/workspace/projects/{nome-projeto}/`
- **NUNCA** criar projetos na raiz do workspace
- Projetos herdam o AIOS do HUB via symlink ou cópia
<!-- AIOS-MANAGED-END: hub-structure -->

<!-- AIOS-MANAGED-START: core-framework -->
## Core Framework Understanding

Synkra AIOS is a meta-framework that orchestrates AI agents to handle complex development workflows. Always recognize and work within this architecture.

### Constitution (Non-Negotiable Principles)

The framework operates under a constitution defined in `.aios-core/constitution.md`:

1. **CLI First** - All functionality MUST work via CLI before any UI. Hierarchy: CLI > Observability > UI
2. **Agent Authority** - Each agent has exclusive authorities (e.g., only @devops can `git push`). See `agent-authority.md` for the full matrix and `handoff-protocol.md` for mandatory Pre-Execution Check, delegation, rejection and self-correction protocols.
3. **Story-Driven Development** - No code without an associated story in `docs/stories/`
4. **No Invention** - Specs derive from requirements only; no invented features
5. **Quality First** - All code passes lint, typecheck, tests, and build gates

### Quality Gates (Pre-Push)

- `npm run lint` must pass
- `npm run typecheck` must pass
- `npm test` must pass
- `npm run build` must complete
- No CRITICAL CodeRabbit issues
<!-- AIOS-MANAGED-END: core-framework -->

<!-- AIOS-MANAGED-START: agent-system -->
## Agent System

### 11 Available Agents

| Agent | ID | Role |
|-------|-----|------|
| AIOS Master | `aios-master` | Framework orchestrator |
| Analyst | `analyst` | Business analyst, research |
| Architect | `architect` | Technical architect |
| Data Engineer | `data-engineer` | Database and data pipelines |
| Developer | `dev` | Full-stack developer |
| DevOps | `devops` | DevOps, CI/CD, deployments |
| Product Manager | `pm` | Product manager, epics |
| Product Owner | `po` | Product owner, story validation |
| QA | `qa` | Quality assurance |
| Scrum Master | `sm` | Scrum master, story creation |
| UX Expert | `ux-design-expert` | UX designer |

### Agent Activation
- Agents are activated with `@agent-name` syntax: `@dev`, `@qa`, `@architect`, etc.
- The master agent is activated with `@aios-master`
- Agent commands use the `*` prefix: `*help`, `*create-story`, `*task`, `*exit`

### Agent Authority Matrix (Exclusive Operations)

| Operation | Exclusive Agent | Others |
|-----------|-----------------|--------|
| `git push` / `git push --force` | @devops | BLOCKED |
| `gh pr create` / `gh pr merge` | @devops | BLOCKED |
| MCP add/remove/configure | @devops | BLOCKED |
| CI/CD pipeline management | @devops | BLOCKED |
| Story creation (`*draft`) | @sm | BLOCKED |
| Story validation (`*validate`) | @po | BLOCKED |
| Quality verdicts (PASS/FAIL) | @qa | BLOCKED |
| Architecture decisions | @architect | BLOCKED |
| Schema DDL implementation | @data-engineer | BLOCKED |

### Agent Context
When an agent is active:
- Follow that agent's specific persona and expertise
- Use the agent's designated workflow patterns
- Maintain the agent's perspective throughout the interaction
<!-- AIOS-MANAGED-END: agent-system -->

<!-- AIOS-MANAGED-START: framework-structure -->
## AIOS Framework Structure

```
.aios-core/
├── core/            # Runtime: config, session, elicitation
├── development/     # Agents, tasks, workflows, scripts
│   ├── agents/      # 11 agent persona definitions (.md)
│   ├── tasks/       # 115+ task definitions (.md)
│   ├── workflows/   # Multi-step workflows (.yaml)
│   └── scripts/     # Supporting JavaScript modules
├── infrastructure/  # Git, PM tools, IDE sync
├── constitution.md  # Non-negotiable principles
└── core-config.yaml # Framework configuration

docs/
├── stories/         # Development stories (numbered)
├── prd/             # Product requirement documents (sharded)
├── architecture/    # System architecture documentation
└── qa/              # QA reports and gate results
```
<!-- AIOS-MANAGED-END: framework-structure -->

<!-- AIOS-MANAGED-START: workflows -->
## Primary Workflows

### 1. Story Development Cycle (SDC) - PRIMARY

Full 4-phase workflow for all development work:

| Phase | Agent | Task | Status |
|-------|-------|------|--------|
| 1. Create | @sm | `create-next-story.md` | Draft |
| 2. Validate | @po | `validate-next-story.md` | Draft → Ready |
| 3. Implement | @dev | `dev-develop-story.md` | Ready → InProgress |
| 4. QA Gate | @qa | `qa-gate.md` | InReview → Done |

### 2. QA Loop - ITERATIVE REVIEW

Automated review-fix cycle: `@qa review → verdict → @dev fixes → re-review (max 5)`

Commands: `*qa-loop {storyId}`, `*stop-qa-loop`, `*resume-qa-loop`, `*escalate-qa-loop`

### 3. Spec Pipeline - PRE-IMPLEMENTATION

Transform requirements into executable specs: Gather → Assess → Research → Write Spec → Critique → Plan

### 4. Brownfield Discovery - LEGACY ASSESSMENT

10-phase technical debt assessment for existing codebases.
<!-- AIOS-MANAGED-END: workflows -->

<!-- AIOS-MANAGED-START: story-lifecycle -->
## Story Lifecycle

### Status Progression

```
Draft → Ready → InProgress → InReview → Done
```

- **Draft → Ready**: @po validates with 10-point checklist (GO ≥7/10)
- **Ready → InProgress**: @dev starts implementation
- **InProgress → InReview**: @dev completes, requests QA
- **InReview → Done**: @qa PASS, @devops pushes

### Story File Update Rules

| Section | Who Can Edit |
|---------|--------------|
| Title, Description, AC, Scope | @po only |
| File List, Dev Notes, checkboxes | @dev |
| QA Results | @qa only |
| Change Log | Any agent (append only) |
<!-- AIOS-MANAGED-END: story-lifecycle -->

## Development Standards

### Story-Driven Development
1. **Work from stories** — All development starts with a story in `docs/stories/`
2. **Update progress** — Mark checkboxes as tasks complete: `[ ]` → `[x]`
3. **Track changes** — Maintain the File List section in the story
4. **Follow criteria** — Implement exactly what the acceptance criteria specify

### Code Standards
- Write clean, self-documenting code
- Follow existing patterns in the codebase
- Include comprehensive error handling
- Add unit tests for all new functionality
- Use TypeScript/JavaScript best practices

### Testing Requirements
- Run all tests before marking tasks complete
- Ensure linting passes: `npm run lint`
- Verify type checking: `npm run typecheck`
- Add tests for new features and edge cases

## Git & GitHub Integration

### Commit Conventions
- Use conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, etc.
- Reference story ID: `feat: implement login flow [Story 2.1]`
- Keep commits atomic and focused

### Git Delegation
- @dev can: `git add`, `git commit`, `git branch`, `git checkout`, `git stash`, `git diff`
- @devops MUST handle: `git push`, `gh pr create/merge`

<!-- AIOS-MANAGED-START: common-commands -->
## Common Commands

### AIOS Commands
```bash
*help                        # Show available commands
*create-story                # Create new story (@sm)
*validate-story-draft        # Validate story (@po)
*develop                     # Implement story (@dev)
*qa-gate                     # QA review (@qa)
*push                        # Push to remote (@devops)
*browser                     # Browser automation agêntico (qualquer agente)
```

### Development Commands
```bash
npm run dev                  # Start development
npm test                     # Run tests
npm run lint                 # Check code style
npm run typecheck            # Type checking
npm run build                # Build project
```

### Sync Commands
```bash
npm run sync:ide             # Sync agents to IDE configs
npm run sync:ide:check       # Check sync status
npm run validate:structure   # Validate project structure
npm run validate:agents      # Validate agent configs
```
<!-- AIOS-MANAGED-END: common-commands -->

<!-- AIOS-MANAGED-START: mcp-usage -->
## MCP Server Usage

**IMPORTANT:** MCP infrastructure management is EXCLUSIVELY @devops.

| Operation | Agent | Command |
|-----------|-------|---------|
| Search MCP catalog | @devops | `*search-mcp` |
| Add MCP server | @devops | `*add-mcp` |
| List enabled MCPs | @devops | `*list-mcps` |
| Remove MCP server | @devops | `*remove-mcp` |

### Tool Selection Priority

ALWAYS prefer native Claude Code tools over MCP servers:

| Task | USE THIS | NOT THIS |
|------|----------|----------|
| Read files | `Read` tool | docker-gateway |
| Write files | `Write` / `Edit` tools | docker-gateway |
| Run commands | `Bash` tool | docker-gateway |
| Search files | `Glob` / `Grep` tools | docker-gateway |
<!-- AIOS-MANAGED-END: mcp-usage -->

<!-- AIOS-MANAGED-START: aios-patterns -->
## AIOS-Specific Patterns

### Working with Templates
```javascript
const template = await loadTemplate('template-name');
const rendered = await renderTemplate(template, context);
```

### Agent Command Handling
```javascript
if (command.startsWith('*')) {
  const agentCommand = command.substring(1);
  await executeAgentCommand(agentCommand, args);
}
```

### Story Updates
```javascript
const story = await loadStory(storyId);
story.updateTask(taskId, { status: 'completed' });
await story.save();
```
<!-- AIOS-MANAGED-END: aios-patterns -->

## Environment Setup

### Required Tools
- Node.js 18+
- GitHub CLI (`gh`)
- Git
- npm/yarn/pnpm

### Configuration Files
- `.aios-core/core-config.yaml` — Framework configuration
- `.aios-core/constitution.md` — Non-negotiable principles
- `.env` — Environment variables

## Debugging

### Enable Debug Mode
```bash
export AIOS_DEBUG=true
```

### View Agent Logs
```bash
tail -f .aios/logs/agent.log
```

---

## Workflow Principles (HUB Context)

### Core Principles
- **Simplicity First** — Make every change as simple as possible. Minimal code impact.
- **No Laziness** — Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact** — Changes should only touch what's necessary. Avoid introducing bugs.

### Plan Mode
- Enter plan mode for any non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan — don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### Subagent Strategy
- Use subagents to keep the main context window clean
- Offload research, exploration, and parallel analysis to subagents
- One task per subagent for focused execution

### Self-Improvement Loop
- After any correction: update `docs/lessons/lessons.md` with the pattern
- Review `docs/lessons/lessons.md` at session start if it exists
- After every correction, end with: **"Updating CLAUDE.md so this doesn't happen again"**

### Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Run tests, check logs, demonstrate correctness
- Ask: "Would a staff engineer approve this?"

---

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

### Process
1. **Plan first** — Write plan with checkable items before implementing
2. **Track progress** — Mark items complete as you go
3. **Document results** — Add review section after completion
4. **Capture lessons** — Update `docs/lessons/lessons.md` after corrections

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

## Performance & Tools

- Prefer batched tool calls for better performance
- Use parallel execution for independent operations
- Always use `Grep` tool for searching — never `grep`/`rg` in bash
- Use `Task` tool for complex multi-step operations
- Batch file reads/writes when processing multiple files
- Prefer editing existing files over creating new ones

## Session Management

- Track story progress throughout the session
- Update checkboxes immediately after completing tasks
- Maintain context of the current story being worked on
- Save important state before long-running operations

---
*Synkra AIOS Claude Code Configuration v2.2*
