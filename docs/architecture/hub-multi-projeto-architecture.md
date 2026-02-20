# Architecture Document
## Hub Multi-Projeto AIOS

**Version:** 1.0
**Architect:** Aria (@architect)
**Date:** 2026-02-19
**PRD Reference:** docs/prd/hub-multi-projeto.md

---

## 1. Architecture Overview

### 1.1 System Context

O Hub Multi-Projeto AIOS é uma camada de orquestração que transforma um workspace AIOS único em um **Hub central** capaz de gerenciar múltiplos projetos isolados, cada um com seu próprio `.aios-core/`.

```
┌─────────────────────────────────────────────────────────────────┐
│                        HUB WORKSPACE                            │
│                     D:\workspace\                               │
├─────────────────────────────────────────────────────────────────┤
│  .aios-core/          ← Framework AIOS global                   │
│  ├── data/                                                     │
│  │   ├── entity-registry.yaml  ← + entidades tipo "projects"   │
│  │   ├── learned-patterns.yaml ← padrões globais               │
│  │   └── workspace-memory.md   ← memória narrativa             │
│  ├── scripts/                                                  │
│  │   └── sync-projects.js      ← NOVO: sincronização           │
│  └── development/                                              │
│      └── agents/aios-master.md ← + comandos de hub             │
├─────────────────────────────────────────────────────────────────┤
│  projects/                  ← Projetos isolados                 │
│  ├── projeto-alpha/                                            │
│  │   └── .aios-core/       ← AIOS do projeto                   │
│  │       └── .aios/project-status.yaml                         │
│  └── projeto-beta/                                             │
│      └── .aios-core/                                           │
├─────────────────────────────────────────────────────────────────┤
│  .aios/                    ← Status do Hub                      │
│  ├── project-status.yaml   ← Status consolidado                │
│  ├── session-state.json    ← Sessão cross-project              │
│  └── hub-context.json      ← Contexto do hub                   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Design Principles

1. **Non-Invasive**: Modificações mínimas no core AIOS existente
2. **Backward Compatible**: Projetos sem Hub funcionam normalmente
3. **Event-Driven Sync**: Sincronização na ativação, não contínua
4. **Graceful Degradation**: Falhas de sync não impedem operação
5. **YAML-First**: Configuração e estado em YAML para transparência

---

## 2. Component Architecture

### 2.1 Entity Registry Extension

**Arquivo:** `.aios-core/data/entity-registry.yaml`

**Mudança:** Adicionar tipo `projects` ao schema de entidades.

```yaml
# Estrutura atual
entities:
  tasks: { ... }
  templates: { ... }
  workflows: { ... }
  # ...

# NOVO: Adicionar seção projects
  projects:
    projeto-alpha:
      path: projects/projeto-alpha
      aiosCore: projects/projeto-alpha/.aios-core
      type: project
      purpose: "Sistema de gestão de clientes"
      status: active           # active | paused | archived
      lastActivity: "2026-02-19T10:30:00.000Z"
      techStack:
        - React
        - Node.js
        - PostgreSQL
      activeStory: "1.2"
      activeEpic: "1"
      description: "Sistema para gestão de clientes e vendas"
      keywords:
        - crm
        - vendas
        - clientes
      adaptability:
        score: 1.0  # Projetos não são adaptáveis
        constraints: ["isolated"]
        extensionPoints: []
      lastVerified: "2026-02-19T10:30:00.000Z"
```

**Schema de Project Entity:**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `path` | string | Sim | Caminho relativo ao Hub |
| `aiosCore` | string | Sim | Caminho para .aios-core do projeto |
| `type` | string | Sim | Sempre "project" |
| `purpose` | string | Sim | Descrição breve do projeto |
| `status` | enum | Sim | active, paused, archived |
| `lastActivity` | ISO8601 | Sim | Timestamp da última atividade |
| `techStack` | string[] | Não | Tecnologias utilizadas |
| `activeStory` | string | Não | Story atual (ex: "1.2") |
| `activeEpic` | string | Não | Epic atual (ex: "1") |
| `description` | string | Não | Descrição detalhada |
| `keywords` | string[] | Não | Palavras-chave para busca |

---

### 2.2 sync-projects.js

**Arquivo:** `.aios-core/scripts/sync-projects.js`

**Responsabilidade:** Escanear `projects/`, detectar projetos AIOS, e atualizar registry.

```javascript
/**
 * SyncProjects - Hub Project Synchronization
 *
 * Escaneia projects/, detecta .aios-core/, e atualiza:
 * 1. entity-registry.yaml (seção projects)
 * 2. .aios/hub-context.json (cache rápido)
 * 3. .aios/project-status.yaml (status consolidado)
 *
 * Performance: < 5s para 10 projetos
 * Execution: Na ativação do AIOS Master (async, non-blocking)
 */

class SyncProjects {
  constructor(hubRoot) {
    this.hubRoot = hubRoot;
    this.projectsDir = path.join(hubRoot, 'projects');
    this.entityRegistryPath = path.join(hubRoot, '.aios-core', 'data', 'entity-registry.yaml');
    this.hubContextPath = path.join(hubRoot, '.aios', 'hub-context.json');
    this.projectStatusPath = path.join(hubRoot, '.aios', 'project-status.yaml');
  }

  /**
   * Main sync function
   * @returns {Promise<SyncResult>}
   */
  async sync() {
    const startTime = Date.now();

    // 1. Scan projects directory
    const detectedProjects = await this.scanProjects();

    // 2. Load current registry
    const currentRegistry = await this.loadEntityRegistry();
    const currentProjects = currentRegistry.entities?.projects || {};

    // 3. Compare and determine changes
    const changes = this.computeChanges(currentProjects, detectedProjects);

    // 4. Update entity registry
    await this.updateEntityRegistry(currentRegistry, changes);

    // 5. Update hub context (fast cache)
    await this.updateHubContext(detectedProjects);

    // 6. Update consolidated project status
    await this.updateConsolidatedStatus(detectedProjects);

    return {
      duration: Date.now() - startTime,
      added: changes.added,
      updated: changes.updated,
      removed: changes.removed,
      total: detectedProjects.length,
    };
  }

  /**
   * Scan projects directory for valid AIOS projects
   */
  async scanProjects() {
    const projects = [];

    try {
      const entries = await fs.readdir(this.projectsDir, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const projectPath = path.join(this.projectsDir, entry.name);
        const aiosCorePath = path.join(projectPath, '.aios-core');

        // Check if valid AIOS project
        if (await this.isValidAiosProject(aiosCorePath)) {
          const projectInfo = await this.getProjectInfo(projectPath);
          projects.push({
            name: entry.name,
            ...projectInfo,
          });
        }
      }
    } catch (error) {
      // projects/ doesn't exist or other error
      console.warn('[SyncProjects] Scan failed:', error.message);
    }

    return projects;
  }

  /**
   * Check if directory contains valid AIOS structure
   */
  async isValidAiosProject(aiosCorePath) {
    try {
      const configPath = path.join(aiosCorePath, 'core-config.yaml');
      await fs.access(configPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Extract project info from .aios/project-status.yaml
   */
  async getProjectInfo(projectPath) {
    const statusPath = path.join(projectPath, '.aios', 'project-status.yaml');

    try {
      const content = await fs.readFile(statusPath, 'utf8');
      const status = yaml.load(content);

      return {
        path: `projects/${path.basename(projectPath)}`,
        aiosCore: `projects/${path.basename(projectPath)}/.aios-core`,
        status: this.inferProjectStatus(status),
        lastActivity: status?.status?.lastUpdate || new Date().toISOString(),
        activeStory: status?.status?.currentStory || null,
        activeEpic: status?.status?.currentEpic || null,
        techStack: await this.detectTechStack(projectPath),
      };
    } catch {
      return {
        path: `projects/${path.basename(projectPath)}`,
        aiosCore: `projects/${path.basename(projectPath)}/.aios-core`,
        status: 'active',
        lastActivity: new Date().toISOString(),
      };
    }
  }

  /**
   * Infer project status from project-status.yaml content
   */
  inferProjectStatus(status) {
    if (!status) return 'active';

    // Check for blockers or stalled work
    const modifiedCount = status?.status?.modifiedFilesTotalCount || 0;
    const hasChanges = modifiedCount > 0;

    // Could add more heuristics here
    return hasChanges ? 'active' : 'active';
  }

  /**
   * Detect tech stack from project files
   */
  async detectTechStack(projectPath) {
    const techStack = [];

    try {
      // Check package.json
      const pkgPath = path.join(projectPath, 'package.json');
      const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));

      if (pkg.dependencies?.react) techStack.push('React');
      if (pkg.dependencies?.next) techStack.push('Next.js');
      if (pkg.dependencies?.express) techStack.push('Express');
      if (pkg.dependencies?.typescript || pkg.devDependencies?.typescript) techStack.push('TypeScript');
      if (pkg.dependencies?.tailwindcss) techStack.push('TailwindCSS');
    } catch {
      // No package.json
    }

    return techStack;
  }

  // ... additional methods for registry update, hub context, etc.
}

// CLI interface
if (require.main === module) {
  const syncer = new SyncProjects(process.cwd());
  syncer.sync().then(result => {
    console.log(JSON.stringify(result, null, 2));
  });
}

module.exports = { SyncProjects };
```

**Performance Targets:**
- Scan: < 500ms per project
- Total sync: < 5s for 10 projects
- Memory: < 50MB

---

### 2.3 Hub Context File

**Arquivo:** `.aios/hub-context.json`

**Propósito:** Cache rápido para leitura no greeting (evita parse de YAML grande).

```json
{
  "version": "1.0",
  "lastSync": "2026-02-19T10:30:00.000Z",
  "hubRoot": "D:\\workspace",
  "projects": {
    "projeto-alpha": {
      "status": "active",
      "lastActivity": "2026-02-19T10:30:00.000Z",
      "activeStory": "1.2",
      "activeEpic": "1"
    },
    "projeto-beta": {
      "status": "paused",
      "lastActivity": "2026-02-15T14:20:00.000Z",
      "activeStory": null,
      "activeEpic": "2"
    }
  },
  "summary": {
    "total": 2,
    "active": 1,
    "paused": 1,
    "archived": 0
  }
}
```

---

### 2.4 Unified Activation Pipeline Integration

**Arquivo:** `.aios-core/development/scripts/unified-activation-pipeline.js`

**Modificação:** Adicionar loader de Hub Context (Tier 3, best-effort).

```javascript
// Adicionar ao LOADER_TIERS
const LOADER_TIERS = {
  // ... existing tiers ...
  bestEffort: {
    loaders: ['sessionContext', 'projectStatus', 'hubContext'], // ADICIONADO
    timeout: 180,
    description: '...',
  },
};

// No método _runPipeline, adicionar:
async _runPipeline(agentId, options, coreConfig, startTime) {
  // ... existing code ...

  // --- Tier 3: Best-effort (SessionContext + ProjectStatus + HubContext) ---
  const [sessionContext, projectStatus, hubContext] = await Promise.all([
    // ... existing loaders ...
    this._profileLoader('hubContext', metrics, tier3Remaining, async () => {
      // Only load for aios-master agent
      if (agentId !== 'aios-master') return null;

      const hubContextPath = path.join(this.projectRoot, '.aios', 'hub-context.json');
      try {
        const content = await fs.readFile(hubContextPath, 'utf8');
        return JSON.parse(content);
      } catch {
        return null;
      }
    }),
  ]);

  // Add to enrichedContext
  const enrichedContext = {
    // ... existing fields ...
    hubContext: hubContext || null,
  };

  // ... rest of pipeline ...
}
```

**GreetingBuilder Modification:**

```javascript
// Em greeting-builder.js, adicionar método para formatar hub context
_formatHubContext(hubContext) {
  if (!hubContext || !hubContext.summary) return '';

  const { total, active, paused } = hubContext.summary;

  if (total === 0) {
    return '📂 Nenhum projeto no Hub';
  }

  const parts = [`📂 ${total} projeto${total > 1 ? 's' : ''}`];

  if (active > 0) {
    parts.push(`${active} ativo${active > 1 ? 's' : ''}`);
  }

  if (paused > 0) {
    parts.push(`${paused} pausado${paused > 1 ? 's' : ''}`);
  }

  return parts.join(' | ');
}
```

---

### 2.5 AIOS Master Commands

**Arquivo:** `.aios-core/development/agents/aios-master.md`

**Comandos a adicionar:**

```yaml
commands:
  # ... existing commands ...

  # Hub Commands (Epic 2)
  - name: list-projects
    args: '[--status active|paused|archived]'
    description: 'List all projects in Hub with their status'
    visibility: [full, quick, key]

  - name: create-project
    args: '{name} [--template greenfield|brownfield|custom]'
    description: 'Create new project with isolated AIOS'
    visibility: [full, quick, key]

  - name: switch-project
    args: '{name}'
    description: 'Switch context to specific project'
    visibility: [full, quick, key]

  - name: project-status
    args: '[name]'
    description: 'Show detailed status of project (or current project)'
    visibility: [full, quick]

  - name: hub
    description: 'Return to Hub context from project'
    visibility: [full, quick, key]

  - name: sync
    description: 'Force project synchronization'
    visibility: [full]
```

---

### 2.6 Project Status Schema (Hub-Level)

**Arquivo:** `.aios/project-status.yaml`

**Propósito:** Status consolidado do Hub (não confundir com project-status.yaml de projetos).

```yaml
# Hub Project Status - Consolidated View
version: "1.0"
lastSync: "2026-02-19T10:30:00.000Z"

# Hub-level status (git of hub root)
hub:
  branch: main
  modifiedFiles: []
  recentCommits:
    - "docs: add hub architecture"
  isGitRepo: true

# Projects summary
projects:
  total: 2
  active: 1
  paused: 1
  archived: 0

# Per-project status (lightweight)
projectList:
  projeto-alpha:
    status: active
    lastActivity: "2026-02-19T10:30:00.000Z"
    branch: feature/story-1.2
    activeStory: "1.2"
    activeEpic: "1"
    modifiedFiles: 3

  projeto-beta:
    status: paused
    lastActivity: "2026-02-15T14:20:00.000Z"
    branch: main
    activeStory: null
    activeEpic: "2"
    modifiedFiles: 0
```

---

### 2.7 Workspace Memory

**Arquivo:** `.aios-core/data/workspace-memory.md`

**Propósito:** Memória narrativa do Hub, editável pelo usuário.

```markdown
# Workspace Memory — Hub AIOS

## Contexto Global
- **Criado em:** 2026-02-19
- **Dono:** João
- **Propósito:** Hub pessoal para desenvolvimento e automação

## Projetos Ativos

| Projeto | Status | Tech | Próximos Passos |
|---------|--------|------|-----------------|
| projeto-alpha | Ativo | React, Node.js | Story 1.2: Autenticação |
| projeto-beta | Pausado | Python | Retomar Epic 2 |

## Decisões de Arquitetura (ADRs)

### ADR-001: Estrutura Hub-and-Spoke (2026-02-19)
**Decisão:** Adotar estrutura hub-and-spoke com projetos isolados em `projects/`
**Racional:** Permite isolamento de contexto enquanto mantém visibilidade global
**Consequências:** Cada projeto tem seu próprio .aios-core/, sync necessário na ativação

## Padrões Conhecidos

### Preferências de Código
- TypeScript para novos projetos
- Conventional commits
- Test-driven development quando possível

### Workflows Favoritos
- Story Development Cycle para features
- QA Loop para revisão

## Lições Aprendidas

- [Adicionar lições conforme o uso]
```

---

## 3. Data Flow

### 3.1 Activation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                 AIOS Master Activation                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Tier 1 (Critical, 80ms): AgentConfig                           │
│  └─ Load aios-master.md definition                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Tier 2 (High, 120ms): PermissionMode + GitConfig               │
│  └─ Load permission badge and git branch                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Tier 3 (Best-effort, 180ms):                                   │
│  ├─ SessionContext (existing)                                   │
│  ├─ ProjectStatus (existing)                                    │
│  └─ HubContext (NEW)                                            │
│     └─ Read .aios/hub-context.json                              │
│     └─ If missing or stale (>60s): trigger sync-projects.js    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  GreetingBuilder                                                 │
│  └─ Format greeting with hub context                            │
│  └─ "👑 Orion ready | 📂 2 projetos | 1 ativo"                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Sync Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    sync-projects.js                              │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Scan projects/  │ │ Read project    │ │ Update          │
│ for .aios-core/ │ │ status files    │ │ entity-registry │
└─────────────────┘ └─────────────────┘ └─────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Output Files:                                                   │
│  ├─ .aios-core/data/entity-registry.yaml (projects section)     │
│  ├─ .aios/hub-context.json (fast cache)                         │
│  └─ .aios/project-status.yaml (consolidated)                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Implementation Sequence

### Phase 1: Foundation (MVP - Epics 1-4)

| Ordem | Componente | Arquivo | Dependências |
|-------|------------|---------|--------------|
| 1 | Schema Project Entity | entity-registry.yaml | Nenhum |
| 2 | Script sync-projects.js | .aios-core/scripts/ | Schema |
| 3 | Hub Context File | .aios/hub-context.json | sync-projects.js |
| 4 | Pipeline Integration | unified-activation-pipeline.js | Hub Context |
| 5 | GreetingBuilder Update | greeting-builder.js | Pipeline |
| 6 | Comando *list-projects | aios-master.md + task | Registry |
| 7 | Comando *create-project | aios-master.md + task | Registry |
| 8 | Comando *switch-project | aios-master.md + task | Todos anteriores |
| 9 | Workspace Memory | workspace-memory.md | Nenhum |

### Phase 2: Expansion (Epics 5-6)

| Ordem | Componente | Arquivo |
|-------|------------|---------|
| 10 | Global Workflows | workflows/ |
| 11 | Global Squads | squads/ |
| 12 | MCP Hub-Level | .claude/mcp.json |

---

## 5. Risk Mitigation

### 5.1 Performance Risks

| Risco | Mitigação |
|-------|-----------|
| Sync lento (>5s) | Cache em hub-context.json, async na ativação |
| entity-registry muito grande | Lazy loading da seção projects |
| Muitos projetos | Paginação no *list-projects, limite de 50 |

### 5.2 Compatibility Risks

| Risco | Mitigação |
|-------|-----------|
| Projetos sem .aios/ | Graceful degradation, status "unknown" |
| YAML malformado | Validação + cleanup automático |
| Paths Windows vs Unix | path.join() sempre, nunca concatenação |

### 5.3 Data Integrity Risks

| Risco | Mitigação |
|-------|-----------|
| Conflito de registry | File locking no sync |
| Cache stale | TTL de 60s + invalidação por git fingerprint |
| Perda de dados | Backup do registry antes de modify |

---

## 6. Testing Strategy

### 6.1 Unit Tests

- `sync-projects.test.js`: Scan, detect, update registry
- `hub-context.test.js`: Read, write, invalidate cache
- `greeting-builder-hub.test.js`: Format hub context

### 6.2 Integration Tests

- Activation pipeline with hub context
- *list-projects command
- *create-project command
- *switch-project context preservation

### 6.3 Manual Tests

- Fresh hub (no projects)
- Hub with 1 project
- Hub with 10+ projects
- Project with invalid .aios-core
- Network drive (slow I/O)

---

## 7. Future Considerations

### 7.1 Phase 2 Features

- Global workflows executáveis no Hub
- Squads cross-project
- Templates de projeto

### 7.2 Phase 3 Features

- MCPs para ads (Google, Meta)
- Scrapping de redes sociais
- AI Clones personalizados

### 7.3 Scalability

- Suporte a 100+ projetos
- Projetos em drives externos
- Projetos remotos (git worktrees)

---

## 8. Appendix

### 8.1 File Manifest

```
.aios-core/
├── data/
│   ├── entity-registry.yaml      # MODIFIED: add projects section
│   ├── learned-patterns.yaml     # MODIFIED: add hub patterns
│   └── workspace-memory.md       # NEW
├── scripts/
│   └── sync-projects.js          # NEW
└── development/
    ├── agents/
    │   └── aios-master.md        # MODIFIED: add commands
    └── tasks/
        ├── list-projects.md      # NEW
        ├── create-project.md     # NEW
        └── switch-project.md     # NEW

.aios/
├── project-status.yaml           # MODIFIED: hub-level format
├── hub-context.json              # NEW
└── session-state.json            # MODIFIED: track current project

projects/                         # NEW directory
└── (project directories)
```

### 8.2 Configuration Changes

**core-config.yaml additions:**

```yaml
# Hub configuration
hub:
  enabled: true
  projectsDir: projects
  syncOnActivation: true
  syncTimeout: 5000
  maxProjects: 50

# Hub context in projectStatus
projectStatus:
  hubContext: true
  hubCacheTTL: 60
```

---

*Aria (@architect) — Arquitetando o futuro 🏗️*
*Synkra AIOS Framework*
