# Hub Commands Reference — Novas Funções

**Data:** 2026-02-20
**Epic:** Epic 2 - Hub Commands
**Status:** Implementado, aguardando QA

---

## Comandos Disponíveis

### 1. `*list-projects` — Listar Projetos

**Uso:** `*list-projects [--status active|paused|archived]`

**Descrição:** Lista todos os projetos do Hub com status, última atividade e epic/story ativos.

**Exemplo:**
```bash
node .aios-core/scripts/hub-list-projects.js
node .aios-core/scripts/hub-list-projects.js --status active
```

**Output:**
```
📊 Hub Projects
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nome              Status    Última Atividade    Epic/Story
──────────────────────────────────────────────────────────────────
teste-alpha       active    2026-02-20 15:30    Epic 1 / Story 1.2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: 1 projeto(s) | 🟢 Active: 1 | 🟡 Paused: 0 | ⚫ Archived: 0
```

---

### 2. `*create-project` — Criar Novo Projeto

**Uso:** `*create-project {nome} [--template greenfield|brownfield|custom]`

**Descrição:** Cria um novo projeto AIOS isolado em `projects/{nome}/` com estrutura completa.

**Templates:**
- `greenfield` — Projeto novo do zero (padrão)
- `brownfield` — Projeto existente sendo migrado
- `custom` — Estrutura mínima

**Exemplo:**
```bash
node .aios-core/scripts/hub-create-project.js meu-app --template greenfield
```

**Estrutura criada:**
```
projects/meu-app/
├── .aios/
│   └── project-status.yaml
├── .aios-core/
│   ├── core-config.yaml
│   └── constitution.md
├── docs/
│   ├── stories/
│   ├── prd/
│   └── architecture/
├── src/
└── README.md
```

---

### 3. `*switch-project` — Trocar Contexto

**Uso:** `*switch-project {nome}`

**Descrição:** Alterna o contexto de trabalho para um projeto específico. Atualiza `session-state.json`.

**Exemplo:**
```bash
node .aios-core/scripts/hub-switch-project.js teste-alpha
```

**Output:**
```
👑 AIOS Master — Projeto: teste-alpha
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Status: active
🎯 Epic ativo: 1 - Foundation
📋 Story ativa: 1.2 - Sync Projects

Comandos: *hub (voltar ao Hub) | *help
```

---

### 4. `*hub` — Voltar ao Hub

**Uso:** `*hub`

**Descrição:** Retorna ao contexto do Hub a partir de um projeto.

**Exemplo:**
```bash
node .aios-core/scripts/hub-return.js
```

**Output:**
```
✅ Switched from "teste-alpha" to Hub

👑 AIOS Master — Hub Context
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Projetos: 1 total
   🟢 Active: 1
   🟡 Paused: 0
   ⚫ Archived: 0

Comandos: *switch-project {nome} | *list-projects | *help
```

---

### 5. `*project-status` — Status do Projeto

**Uso:** `*project-status [{nome}]`

**Descrição:** Mostra status detalhado de um projeto. Sem argumento, mostra status do projeto atual (se em contexto de projeto).

**Modos:**
- Com nome: Status completo com commits e blockers
- Sem nome (em projeto): Status compacto
- Sem nome (fora de projeto): Erro

**Exemplo (completo):**
```bash
node .aios-core/scripts/hub-project-status.js teste-alpha
```

**Output:**
```
📊 Status do Projeto: teste-alpha
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Informações Gerais
├── Status: active
├── Última atividade: 2026-02-20 15:30
└── Criado em: 2026-02-20

🎯 Epic Ativo: 1 - Foundation
📋 Story Ativa: 1.2 - Sync Projects

📝 Últimos Commits (5)
└── (sem commits ou não é repo git)
```

**Exemplo (compacto):**
```bash
# Dentro de contexto de projeto
node .aios-core/scripts/hub-project-status.js
```

**Output:**
```
📊 teste-alpha | active | Epic 1 | Story 1.2
```

---

## Fluxo de Trabalho Típico

```bash
# 1. Listar projetos disponíveis
*list-projects

# 2. Criar novo projeto
*create-project meu-novo-app

# 3. Trocar para o projeto
*switch-project meu-novo-app

# 4. Verificar status
*project-status

# 5. Trabalhar no projeto...
# (comandos AIOS normais operam no contexto do projeto)

# 6. Voltar ao Hub
*hub
```

---

## Arquivos de Estado

### `.aios/session-state.json`
Gerencia o contexto atual (hub vs projeto):

```json
{
  "version": "1.0",
  "hubRoot": "D:\\workspace",
  "currentContext": "project",
  "currentProject": "teste-alpha",
  "switchedAt": "2026-02-20T15:30:00.000Z",
  "history": [
    {
      "from": "hub",
      "to": "teste-alpha",
      "at": "2026-02-20T15:30:00.000Z"
    }
  ]
}
```

### `.aios/hub-context.json`
Cache de projetos com metadados:

```json
{
  "version": "1.0",
  "lastSync": "2026-02-20T15:30:00.000Z",
  "projects": {
    "teste-alpha": {
      "status": "active",
      "lastActivity": "2026-02-20T15:30:00.000Z",
      "path": "projects/teste-alpha"
    }
  },
  "summary": {
    "total": 1,
    "active": 1,
    "paused": 0,
    "archived": 0
  }
}
```

---

## Scripts Disponíveis

| Script | Função |
|--------|--------|
| `hub-list-projects.js` | Lista projetos |
| `hub-create-project.js` | Cria projeto |
| `hub-switch-project.js` | Troca contexto |
| `hub-return.js` | Retorna ao Hub |
| `hub-project-status.js` | Status do projeto |

---

*Documento criado para referência futura — Quinn (@qa)*
