# System Architecture - Synkra AIOS HUB

> **Document Type:** System Architecture Analysis
> **Generated:** 2026-02-20
> **Workflow:** Brownfield Discovery - Phase 1
> **Agent:** @architect

---

## 1. Executive Summary

Synkra AIOS HUB é um meta-framework de orquestração de agentes AI para desenvolvimento full-stack. O sistema implementa uma arquitetura baseada em agentes especializados que colaboram através de tasks, workflows e uma constitution que define princípios inegociáveis.

### Key Metrics

| Métrica | Valor |
|---------|-------|
| Versão AIOS Core | 4.2.13 |
| NPM Package | @aios-fullstack/core v4.31.1 |
| Agentes | 12 (incluindo aios-master) |
| Tasks | 205+ |
| Projetos Gerenciados | 2 (clone-ai, moltbot) |
| Node.js Requirement | >=18.0.0 |

---

## 2. Tech Stack

### 2.1 Core Technologies

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| Node.js | >=18.0.0 | Runtime principal |
| TypeScript | - | Type safety (configurado) |
| JavaScript (ESM/CJS) | - | Scripts e módulos |
| Python | 3.x | Browser automation (.venv, .venv-browser) |

### 2.2 Dependencies (AIOS Core)

| Dependência | Versão | Propósito |
|-------------|--------|-----------|
| chalk | ^4.1.2 | Console styling |
| commander | ^12.1.0 | CLI framework |
| fs-extra | ^11.3.0 | File system utilities |
| glob | ^10.4.4 | File pattern matching |
| js-yaml | ^4.1.0 | YAML parsing |
| inquirer | ^8.2.6 | Interactive prompts |
| validator | ^13.15.15 | Input validation |
| diff | ^5.2.0 | Diff utilities |
| execa | ^5.1.1 | Process execution |
| highlight.js | ^11.9.0 | Syntax highlighting |

### 2.3 HUB Root Dependencies

| Dependência | Versão | Propósito |
|-------------|--------|-----------|
| playwright | ^1.58.2 | Browser automation |
| ws | ^8.19.0 | WebSocket communication |

---

## 3. Directory Structure

```
D:/workspace/                          # HUB Root
├── .aios-core/                        # Framework Core
│   ├── cli/                           # CLI commands
│   ├── core/                          # Runtime core
│   │   ├── execution/                 # Build/execution orchestration
│   │   ├── health-check/              # Health checks & healers
│   │   ├── ids/                       # IDS circuit breaker
│   │   ├── orchestration/             # Agent orchestration
│   │   ├── quality-gates/             # Quality gates
│   │   └── registry/                  # Build registry
│   ├── data/                          # Runtime data
│   │   ├── agent-config-requirements.yaml
│   │   ├── aios-kb.md                 # Knowledge base
│   │   ├── entity-registry.yaml       # IDS registry
│   │   ├── learned-patterns.yaml
│   │   ├── technical-preferences.md
│   │   └── workflow-patterns.yaml
│   ├── development/                   # Development tools
│   │   ├── agents/                    # 12 agent definitions (.md)
│   │   ├── tasks/                     # 205+ task definitions
│   │   ├── templates/                 # Service/component templates
│   │   ├── workflows/                 # Workflow definitions (.yaml)
│   │   └── scripts/                   # Supporting scripts (.js)
│   ├── docs/                          # Framework docs
│   ├── elicitation/                   # Elicitation system
│   ├── infrastructure/                # Git, PM tools, IDE sync
│   │   ├── integrations/              # AI providers, external tools
│   │   └── scripts/                   # Infrastructure scripts
│   ├── manifests/                     # CSV manifests
│   │   ├── agents.csv
│   │   ├── tasks.csv
│   │   └── workers.csv
│   ├── monitor/                       # Monitoring
│   ├── presets/                       # Configuration presets
│   ├── product/                       # Product management
│   │   └── templates/                 # PRD, Epic, Story templates
│   ├── schemas/                       # JSON schemas
│   │   ├── agent-v3-schema.json
│   │   ├── task-v3-schema.json
│   │   └── squad-schema.json
│   ├── scripts/                       # Utility scripts
│   ├── workflow-intelligence/         # Learning system
│   ├── constitution.md                # Non-negotiable principles
│   ├── core-config.yaml               # Framework configuration
│   ├── version.json                   # Version tracking
│   └── user-guide.md                  # User documentation
│
├── .aios-tools/                       # External tools
│   ├── browser-use/                   # Browser automation (Python)
│   └── uv-cache/                      # UV package cache
│
├── .claude/                           # Claude Code config
│   ├── CLAUDE.md                      # Main instructions
│   └── rules/                         # Detailed rules
│       ├── agent-authority.md
│       ├── browser-use.md
│       ├── coderabbit-integration.md
│       ├── ids-principles.md
│       ├── story-lifecycle.md
│       └── workflow-execution.md
│
├── docs/                              # HUB documentation
│   ├── architecture/                  # Architecture docs (this file)
│   ├── sessions/                      # Session handoffs
│   └── stories/                       # Development stories
│
├── projects/                          # Managed projects
│   ├── clone-ai/                      # Clone AI project
│   │   ├── .aios-core/                # Symlink/copy of AIOS
│   │   ├── agents/                    # Clone agents
│   │   ├── clones/                    # Clone definitions
│   │   ├── docs/                      # Project docs
│   │   ├── packages/                  # NPM packages
│   │   ├── squads/                    # Agent squads
│   │   └── profiles/                  # Clone profiles
│   │
│   └── moltbot/                       # Moltbot project
│       ├── data/                      # Bot data
│       └── state/                     # Bot state
│
├── squads/                            # Squad templates
│   └── marketing-performance/         # Marketing squad
│
├── workflows/                         # Reusable workflows
│
├── secrets/                           # Sensitive data (gitignored)
│
├── .venv/                             # Python virtual env
├── .venv-browser/                     # Browser automation env
│
├── AGENTS.md                          # Agent documentation
├── HUB-README.md                      # HUB readme
├── constitution.md                    # Framework constitution
└── package.json                       # HUB package config
```

---

## 4. Agent System

### 4.1 Agent Inventory

| Agente | ID | Arquivo | Role |
|--------|-----|---------|------|
| AIOS Master | aios-master | aios-master.md | Framework orchestrator |
| Analyst | analyst | analyst.md | Business analyst, research |
| Architect | architect | architect.md | Technical architect |
| Data Engineer | data-engineer | data-engineer.md | Database and data pipelines |
| Developer | dev | dev.md | Full-stack developer |
| DevOps | devops | devops.md | DevOps, CI/CD, deployments |
| Product Manager | pm | pm.md | Product manager, epics |
| Product Owner | po | po.md | Product owner, story validation |
| QA | qa | qa.md | Quality assurance |
| Scrum Master | sm | sm.md | Scrum master, story creation |
| Squad Creator | squad-creator | squad-creator.md | Squad configuration |
| UX Expert | ux-design-expert | ux-design-expert.md | UX designer |

### 4.2 Agent Authority Matrix

| Operação | Agente Exclusivo | Outros |
|----------|------------------|--------|
| `git push` / `git push --force` | @devops | BLOCKED |
| `gh pr create` / `gh pr merge` | @devops | BLOCKED |
| MCP add/remove/configure | @devops | BLOCKED |
| Story creation (`*draft`) | @sm | BLOCKED |
| Story validation (`*validate`) | @po | BLOCKED |
| Quality verdicts (PASS/FAIL) | @qa | BLOCKED |
| Architecture decisions | @architect | BLOCKED |
| Schema DDL implementation | @data-engineer | BLOCKED |

### 4.3 Agent Activation

```
@agent-name syntax: @dev, @qa, @architect, etc.
Agent commands: *help, *create-story, *task, *exit
Master agent: @aios-master
```

---

## 5. Workflow System

### 5.1 Primary Workflows

| Workflow | Descrição | Fases |
|----------|-----------|-------|
| **Story Development Cycle (SDC)** | PRIMARY - Full dev workflow | 4 phases |
| **QA Loop** | Iterative review-fix cycle | Max 5 iterations |
| **Spec Pipeline** | Requirements to executable spec | 6 phases |
| **Brownfield Discovery** | Technical debt assessment | 10 phases |

### 5.2 Story Development Cycle

```
Phase 1: Create (@sm)     → Story em Draft
Phase 2: Validate (@po)   → Story Ready (GO ≥7/10)
Phase 3: Implement (@dev) → Código + testes
Phase 4: QA Gate (@qa)    → PASS → Done
```

### 5.3 Task System

- **205+ tasks** definidas em `.aios-core/development/tasks/`
- Formato AIOS Task Format V1.0
- Cada task define: inputs, outputs, pre/post-conditions, execution modes

---

## 6. Configuration Files

### 6.1 Framework Configuration

| Arquivo | Propósito |
|---------|-----------|
| `.aios-core/core-config.yaml` | Framework configuration |
| `.aios-core/constitution.md` | Non-negotiable principles |
| `.aios-core/version.json` | Version tracking with file hashes |
| `.aios-core/install-manifest.yaml` | Installation manifest |

### 6.2 Project Configuration

| Arquivo | Propósito |
|---------|-----------|
| `package.json` | NPM configuration |
| `.env` / `.env.example` | Environment variables |
| `.gitignore` | Git ignore rules |
| `tsconfig.base.json` | TypeScript config (clone-ai) |

### 6.3 Claude Code Configuration

| Arquivo | Propósito |
|---------|-----------|
| `.claude/CLAUDE.md` | Main Claude instructions |
| `.claude/rules/*.md` | Detailed rules (6 files) |

---

## 7. Integration Points

### 7.1 AI Providers

- **Claude/Anthropic**: Primary AI provider
- **DeepSeek**: Alternative provider (routing scripts exist)

### 7.2 External Tools

| Tool | Integration | Purpose |
|------|-------------|---------|
| Playwright | MCP + npm | Browser automation |
| Browser-Use | Python (.aios-tools) | Agentic browser automation |
| Notion | API scripts | Database mapping |
| Supabase | Via projects | Database for clone-ai |

### 7.3 MCP Servers

| MCP | Status | Purpose |
|-----|--------|---------|
| playwright | Active | Browser automation |
| desktop-commander | Active | Docker gateway |
| EXA | Via docker-gateway | Web search |
| Context7 | Via docker-gateway | Library docs |
| Apify | Via docker-gateway | Web scraping |

---

## 8. Débitos Técnicos Identificados (System Level)

### 8.1 CRITICAL

| ID | Débito | Área | Impacto |
|----|--------|------|---------|
| SYS-001 | Múltiplos arquivos de mapping JS soltos na raiz | Estrutura | Clutter, má organização |
| SYS-002 | Secrets potencialmente expostos (secrets/) | Segurança | Risco de credential leak |
| SYS-003 | .env trackeado no git | Segurança | Credential exposure |

### 8.2 HIGH

| ID | Débito | Área | Impacto |
|----|--------|------|---------|
| SYS-004 | Arquivos de screenshot na raiz | Estrutura | Clutter |
| SYS-005 | node_modules na raiz do HUB | Estrutura | Confusão de dependências |
| SYS-006 | Múltiplos package.json dispersos | Estrutura | Dependency hell potential |
| SYS-007 | .venv duplicado (.venv, .venv-browser) | Estrutura | Redundância |

### 8.3 MEDIUM

| ID | Débito | Área | Impacto |
|----|--------|------|---------|
| SYS-008 | Arquivos JSON de mapping na raiz | Estrutura | Desorganização |
| SYS-009 | Scripts de mapping duplicados | Código | DRY violation |
| SYS-010 | docs/ sem estrutura padronizada | Documentação | Navegação difícil |

### 8.4 LOW

| ID | Débito | Área | Impacto |
|----|--------|------|---------|
| SYS-011 | HUB-README.md vs README.md | Documentação | Confusão |
| SYS-012 | .codex directory propósito incerto | Estrutura | Desconhecido |

---

## 9. Pontos de Integração com Projetos

### 9.1 clone-ai

- **Symlink AIOS**: `.aios-core/` copiado/symlinked
- **Squads**: Sistema de agentes especializados
- **Clones**: Sistema de personalidade/identidade
- **Supabase**: Integração de banco de dados

### 9.2 moltbot

- **State-based**: Gerenciamento de estado em `state/`
- **Data-driven**: Configurações em `data/`
- **Bot-specific**: Estrutura específica para bots

---

## 10. Recomendações Preliminares

### 10.1 Immediate Actions (Quick Wins)

1. **Mover arquivos de mapping** para `docs/mapping/` ou deletar
2. **Mover screenshots** para `docs/screenshots/` ou deletar
3. **Verificar .gitignore** para secrets/ e .env
4. **Consolidar .venv** se possível

### 10.2 Short-term Actions

1. **Estruturar docs/** com subdiretórios padronizados
2. **Criar script de cleanup** para arquivos temporários
3. **Documentar propósito** do .codex directory
4. **Consolidar scripts** de mapping em ferramenta única

### 10.3 Long-term Actions

1. **Implementar IDS** para evitar duplicação de componentes
2. **Criar CLI command** para health check do HUB
3. **Automatizar discovery** de débitos técnicos

---

## 11. Próximos Passos (Brownfield Discovery)

- [x] **FASE 1:** System Architecture (este documento)
- [ ] **FASE 2:** Database Documentation (@data-engineer)
- [ ] **FASE 3:** Frontend/UX Documentation (@ux-design-expert)
- [ ] **FASE 4:** Consolidation DRAFT (@architect)
- [ ] **FASE 5-7:** Specialist Validation
- [ ] **FASE 8:** Final Assessment
- [ ] **FASE 9:** Executive Report
- [ ] **FASE 10:** Epic + Stories

---

*Generated by @architect | Brownfield Discovery Phase 1*
*Synkra AIOS v4.2.13*
