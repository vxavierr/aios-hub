# Epic: AIOS Bridge

**Epic ID:** BRIDGE-EPIC-1
**Status:** Ready
**Created:** 2026-03-03
**Updated:** 2026-03-03
**Owner:** João
**Project:** `D:/workspace/projects/aios-bridge/`

> ⚠️ **Nota de escopo:** Este epic tem 7 stories e constitui um produto completo.
> Recomendado: PRD completo antes da AB-4 em diante. AB-1 a AB-3 podem avançar agora.

---

## Visão

O AIOS Bridge é o **cockpit visual do AIOS** — uma web app local onde o AIOS Master funciona como centro de controle, monitora todos os agentes em tempo real, e a metodologia AIOS inteira (SDC, Spec Pipeline, Brownfield Discovery) é completamente visual e interativa.

**A metáfora central:** como um `git log --graph --all` — mas cada branch é um agente, cada commit é uma etapa do workflow, e você vê o progresso de tudo simultaneamente.

---

## Goal

Tornar a metodologia AIOS completamente visual: cada etapa do SDC, cada handoff entre agentes, cada story em progresso — tudo visível, rastreável e acionável a partir de um único cockpit, com o AIOS Master como hub central de orquestração.

---

## Description

**Existing System Context:**
- O AIOS HUB (D:/workspace/) gerencia projetos, stories e agentes via CLI e arquivos `.md`/`.yaml`
- A metodologia AIOS (SDC, Spec Pipeline, waves, handoffs) existe apenas em texto — sem representação visual
- O AIOS Master (`@aios-master`) orquestra via comandos textuais em terminais isolados
- Múltiplos agentes trabalham em paralelo sem visibilidade cruzada

**O Problema Real:**
Toda a orquestração AIOS acontece em texto distribuído em arquivos e terminais separados. Não existe forma de ver "onde estamos" no workflow, quem está fazendo o quê, ou o progresso acumulado de um epic. João precisa abrir múltiplos terminais, ler arquivos de story, verificar status manualmente.

**A Solução:**
Uma web app local que lê o filesystem AIOS em tempo real, renderiza o estado atual como interface visual interativa, e permite que o AIOS Master monitore e coordene todos os agentes a partir de um único ponto.

**Base técnica (não partir do zero):**
- **Fork:** Myrlin's Workbook (`therealarthur/myrlin-workbook`) — Node.js + Express + xterm.js + node-pty + kanban, roda no browser
- **Padrão de worktrees:** Dash (`syv-ai/dash`) — reserve pool de worktrees (<100ms para nova tab)
- **Modelo de waves:** Claude Squad (`smtg-ai/claude-squad`) — isolamento real por worktree por story
- **Yolo Mode:** construído do zero (não existe em nenhuma ferramenta existente)

---

## Stories

| Story ID | Título | Executor | Quality Gate | Blockers |
|----------|--------|----------|--------------|----------|
| AB-1 | Foundation: Fork + Backend Core | @dev | @architect | — |
| AB-2 | Terminal Engine: Multi-tab com Worktrees | @dev | @architect | AB-1 |
| AB-3 | AIOS Master Hub: Centro de Controle | @dev | @architect | AB-2 |
| AB-4 | Workflow Visual Pipeline (*kb visual) | @dev | @architect | AB-3 |
| AB-5 | Stories Kanban + AIOS Lifecycle | @dev | @dev | AB-1 |
| AB-6 | Waves View: Desenvolvimento Paralelo | @dev | @architect | AB-5 |
| AB-7 | Yolo Mode: Automação de Handoffs | @dev | @architect | AB-3 |

---

## Story Details

---

### Story AB-1: Foundation — Fork + Backend Core

**executor:** @dev
**quality_gate:** @architect
**quality_gate_tools:** [architecture_review, dependency_audit, fork_strategy]

**As a** developer,
**I want** o projeto AIOS Bridge configurado a partir do fork do Myrlin's Workbook com backend Express + WebSocket funcional,
**So that** as próximas stories tenham base técnica comprovada (PTY + kanban já funcionando) em vez de partir do zero.

**Acceptance Criteria:**
1. Fork de `therealarthur/myrlin-workbook` criado em `D:/workspace/projects/aios-bridge/`
2. Código limpo: remover features não relevantes do Myrlin (os 13 temas extras, mobile toolbar, 4-pane fixo)
3. Estrutura de pastas reorganizada:
   ```
   aios-bridge/
   ├── backend/          # Express + WebSocket + node-pty (do Myrlin)
   ├── frontend/         # Migrado para React + TypeScript + Vite
   │   └── src/
   │       ├── components/
   │       └── features/
   └── package.json
   ```
4. Frontend migrado de Vanilla JS para **React 18 + TypeScript + Vite** (Myrlin usa Vanilla JS — muito difícil de manter/expandir)
5. Backend Express mantido em Node.js + TypeScript
6. `npm run dev` inicia ambos simultaneamente
7. PTY básico funcional: abrir um terminal no browser e rodar um comando
8. README.md com contexto do fork e decisões de arquitetura

**Decisão técnica justificada:**
O Myrlin usa Vanilla JS no frontend — ótimo para ser leve, ruim para manutenção a longo prazo dado a complexidade do que será construído. A migração para React TypeScript é feita na AB-1 antes de construir qualquer feature nova.

**File:** `docs/stories/AB-1.foundation-fork.md`

---

### Story AB-2: Terminal Engine — Multi-tab com Worktrees

**executor:** @dev
**quality_gate:** @architect
**quality_gate_tools:** [architecture_review, security_review, performance_review]

**As a** usuário do AIOS Bridge,
**I want** abrir múltiplas tabs de terminal, cada uma com sessão Claude Code isolada em seu próprio git worktree,
**So that** N agentes possam trabalhar em paralelo sem conflitos de branch.

**Acceptance Criteria:**
1. Tab bar com botão "+" e "×" para abrir/fechar tabs
2. Cada tab cria um PTY process via `node-pty` no backend
3. Padrão de **reserve pool de worktrees** (inspirado no Dash):
   - Backend pré-cria 3 worktrees ao inicializar a app
   - Nova tab abre em < 100ms (worktree já existe, apenas assina o PTY)
   - Pool reabastecido automaticamente quando consumido
4. I/O via WebSocket bidirecional (xterm.js ↔ node-pty)
5. Cada tab possui:
   - Nome do projeto/agente (editável)
   - Cor de identificação (para correlacionar com outras views)
   - Indicador de status: `active` / `waiting` / `idle`
   - Branch name do worktree
6. Resize dinâmico (cols/rows ajustados via WebSocket)
7. `Ctrl+C` funciona; scroll history ilimitado
8. Máximo de 10 tabs simultâneas (com warning)
9. Ao fechar tab: PTY encerrado + worktree limpo + pool reposto

**Security:**
- PTY restrito ao diretório `D:/workspace/`
- Sem execução fora do contexto do workspace

**File:** `docs/stories/AB-2.terminal-engine.md`

---

### Story AB-3: AIOS Master Hub — Centro de Controle

**executor:** @dev
**quality_gate:** @architect
**quality_gate_tools:** [architecture_review, realtime_design, ipc_security]

**As a** AIOS Master,
**I want** um painel central que leia o output de todos os terminais ativos e mostre o estado de cada agente em tempo real,
**So that** eu possa orquestrar o fluxo sem precisar alternar entre terminais manualmente.

**Acceptance Criteria:**

**1. Master Terminal (fixo, sempre visível):**
- Tab especial "@aios-master" que não pode ser fechada
- Sempre visível no topo ou lateral da interface
- Terminal dedicado ao AIOS Master — onde João ativa e interage com `@aios-master`
- Diferenciado visualmente das tabs de outros agentes (cor/ícone especial)

**2. Agent Feed (painel lateral direito):**
- Lista todos os terminais abertos com:
  - Nome do agente (`@dev Dex`, `@qa Quinn`, etc.)
  - Status atual: `🟢 Active` / `🟡 Waiting Input` / `⚪ Idle` / `🔴 Error`
  - Última linha de output (preview da atividade atual)
  - Story sendo trabalhada (detectada via filesystem watch em `docs/stories/`)
  - Tempo de sessão
- Clique em qualquer agente foca aquele terminal

**3. Activity Stream (log unificado):**
- Feed cronológico de eventos de TODOS os terminais
- Cada evento mostra: `[timestamp] @agente: mensagem`
- Filtros: por agente, por tipo (output / handoff / error)
- Detecta e destaca automaticamente padrões AIOS:
  - `HANDOFF →` (em amarelo)
  - `SCOPE REJECTION` (em vermelho)
  - `PASS` / `FAIL` / `GO` / `NO-GO` (com cor correspondente)
  - `Status: Done` (em verde)
- Scroll automático com opção de pause

**4. Leitura de output dos terminais:**
- Backend intercepta stdout de cada PTY (sem interferir no I/O do usuário)
- Os outputs são roteados para o Activity Stream em tempo real
- Nenhuma modificação no comportamento dos terminais

**File:** `docs/stories/AB-3.aios-master-hub.md`

---

### Story AB-4: Workflow Visual Pipeline — *kb Visual

**executor:** @dev
**quality_gate:** @architect
**quality_gate_tools:** [architecture_review, ux_review, data_flow_review]

**As a** João,
**I want** ver a metodologia AIOS inteira como um pipeline visual interativo,
**So that** eu saiba exatamente em que etapa cada story/projeto está e o que precisa acontecer a seguir.

**Acceptance Criteria:**

**1. SDC Pipeline View (por story):**
```
@sm *draft → @po *validate → @dev *develop → @qa *qa-gate → @devops *push
  [Draft]      [Ready]        [InProgress]    [InReview]      [Done]
    ✅            ✅               🔄              ⏳             ⏳
```
- Cada etapa tem: status visual (pending/active/done/failed), agente responsável, tempo gasto
- Etapa atual piscando/destacada
- Clique em etapa mostra detalhes (handoff message, timestamp, agente)

**2. Timeline por Story (estilo git log --graph):**
- Eixo X: tempo
- Cada agente é uma "lane" (linha horizontal)
- Cada ação é um nó na timeline:
  - `@sm` criou story → nó na lane @sm
  - `@po` validou (GO 8/10) → nó na lane @po
  - `@dev` InProgress → linha contínua na lane @dev
  - Handoff `@dev → @qa` → seta conectando as lanes
- Zoom in/out por período
- Hover em qualquer nó abre tooltip com detalhes

**3. Workflow Selector:**
- Tabs na view: `SDC` | `Spec Pipeline` | `Brownfield Discovery` | `QA Loop`
- Cada workflow tem seu próprio diagrama visual com as fases
- Fase atual do projeto destacada em cada workflow

**4. Epic Progress Map:**
- Visão geral do epic com todas as stories
- Cada story como um card com: status, agente atual, % progresso (checkboxes)
- Linhas de dependência entre stories (bloqueadores)
- Agrupado por Wave quando configurado

**5. Data source:**
- Lê `docs/stories/*.md` para status de stories
- Lê `.aios/hub-stories.json` para cache (já existe no HUB)
- Lê `docs/sessions/` para histórico de sessões
- Filesystem watch para atualização em tempo real (<2s de lag)

**File:** `docs/stories/AB-4.workflow-visual-pipeline.md`

---

### Story AB-5: Stories Kanban + AIOS Lifecycle

**executor:** @dev
**quality_gate:** @dev
**quality_gate_tools:** [code_review, ux_review, data_integrity]

**As a** João,
**I want** um kanban board com o lifecycle AIOS completo e campos estruturados de story,
**So that** eu possa gerenciar o backlog visualmente sem precisar editar arquivos `.md` manualmente.

**Acceptance Criteria:**

**1. Board com colunas AIOS:**
```
Draft | Ready | InProgress | InReview | Done
```
- Drag-and-drop entre colunas atualiza o `Status:` no arquivo `.md` da story
- Badge de contagem por coluna
- Filtros: por projeto, por agente, por epic, por prioridade (P0-P3)

**2. Story Card expandido:**
- Story ID, título, epic
- Status badge com cor
- Executor (`@dev`, `@qa`, etc.) + Quality Gate
- Acceptance criteria (checkbox list — marcáveis direto no card)
- Progress bar (checkboxes completados / total)
- Wave assignment
- Última atividade (timestamp do último commit ou output do agente)
- Botão "Abrir Terminal" → abre nova tab com o comando correto

**3. Quick actions por card:**
- `▶ Activate` — cola o comando do próximo passo no terminal do AIOS Master
  - Ex: story em Ready → cola `@dev *develop docs/stories/X.Y.story.md`
- `📋 View File` → abre o `.md` no Doc Viewer (AB-3 integração)
- `🔗 Open in GitHub` → link para o PR se existir

**4. Health Score (topo do board):**
- Score 0-100 calculado por: stories em progresso / total, stories sem blockers, age das stories em InProgress
- Indicador visual: verde ≥70, amarelo 40-69, vermelho <40

**5. Persistência:**
- Lê e escreve nos arquivos `.md` reais das stories (fonte de verdade)
- Sem banco de dados próprio — filesystem como fonte
- Filesystem watch para sincronizar com mudanças feitas via terminal

**File:** `docs/stories/AB-5.stories-kanban.md`

---

### Story AB-6: Waves View — Desenvolvimento Paralelo

**executor:** @dev
**quality_gate:** @architect
**quality_gate_tools:** [architecture_review, concurrency_review]

**As a** João,
**I want** ver o epic organizado em waves com progresso por wave e quais stories estão rodando em paralelo,
**So that** eu possa coordenar o desenvolvimento paralelo e saber o que está bloqueando o avanço.

**Acceptance Criteria:**

**1. Waves View (por epic):**
```
WAVE-1: Fundação          [Concluída] ████████████ 2/2 stories
WAVE-2: Core Backend      [Em Progresso] ███████░░░ 3/5 stories (80%)
   ├── AB-1: Foundation   ✅ Done       @dev
   ├── AB-2: Terminal     🔄 InProgress @dev Dex
   ├── AB-3: Master Hub   ⏳ Ready      @dev
   ├── AB-5: Kanban       🔄 InProgress @dev
   └── AB-7: Yolo Mode    📋 Draft      @sm River
WAVE-3: Visual Layer      [Planejada]  ░░░░░░░░░░░ 0/2 stories
```

**2. Wave Assignment:**
- Drag-and-drop para mover stories entre waves
- "Auto-organize" button: detecta dependências entre stories e sugere wave grouping automaticamente
- Validação: stories na mesma wave não podem ter dependências entre si

**3. Parallel Execution Status:**
- Para cada wave "Em Progresso": mostra quais stories têm agente ativo vs. esperando
- Identifica gargalos: story em InProgress há muito tempo sem progresso
- Alerta quando uma story bloqueia toda a wave seguinte

**4. Wave Progress na Navbar:**
- Badge no topo: `Wave 2/3 · 80%` sempre visível
- Barra de progresso global do epic

**5. Integração com Terminal Engine (AB-2):**
- Botão "Launch Wave" na wave Ready: abre um terminal por story, com o comando correto pré-carregado
- Para waves com 5 stories → abre 5 tabs, cada uma com `@sm *draft ...` ou `@dev *develop ...` conforme o status

**File:** `docs/stories/AB-6.waves-view.md`

---

### Story AB-7: Yolo Mode — Automação de Handoffs

**executor:** @dev
**quality_gate:** @architect
**quality_gate_tools:** [architecture_review, security_review, ux_review]

**As a** João,
**I want** que o AIOS Bridge detecte automaticamente padrões de handoff nos terminais e proponha (ou execute) o próximo comando em nova tab,
**So that** a transição entre agentes seja fluida sem copy-paste manual.

**Acceptance Criteria:**

**1. Detecção de Handoff (backend):**
- Monitora stdout de TODOS os terminais via AB-3 (Activity Stream)
- Detecta o padrão AIOS de handoff:
  ```
  Next step: Open a new session and run:
  @{agent} *{command} {args}
  ```
- Extrai: agente alvo, comando, argumentos completos
- Latência de detecção: < 500ms após o output aparecer

**2. Modos de operação (configurável no Settings):**

| Modo | Comportamento |
|------|--------------|
| **Off** | Nenhuma ação automática |
| **Suggest** (default) | Toast notification com o comando. Botões: [Abrir Tab] [Copiar] [Ignorar] |
| **Auto** | Abre nova tab + digita o comando + aguarda 5s com countdown cancelável |
| **Full Yolo** | Abre nova tab + executa imediatamente sem countdown |

**3. Handoff Notification (modo Suggest):**
- Toast aparece no canto superior direito
- Mostra: `@dev → @qa: *qa-gate docs/stories/2.3.story.md`
- Persiste por 30s ou até interação
- Visível mesmo com o terminal maximizado
- Som opcional (toggle no Settings)

**4. Handoff Log:**
- Painel lateral com histórico dos últimos 50 handoffs detectados
- Cada entrada: timestamp, terminal origem, agente de → para, comando completo, ação tomada (ignored/opened/executed)
- Export JSON

**5. Regex configurável:**
- Settings permite editar o pattern de detecção
- Suporte a patterns alternativos (ex: handoffs em português ou outros formatos)
- Test button: cola um texto e verifica se o pattern detecta

**6. Integração com Waves (AB-6):**
- Handoff detectado automaticamente atualiza o status da story no Kanban
- Ex: `@dev` termina e faz handoff para `@qa` → story move de InProgress para InReview automaticamente

**Security:**
- Full Yolo requer confirmação uma vez (explicação de riscos na primeira ativação)
- Todos os comandos executados logados em `~/.aios/bridge-yolo-log.json`
- Sem execução de comandos arbitrários — apenas comandos AIOS válidos (`@{agent} *{command}`)

**File:** `docs/stories/AB-7.yolo-mode.md`

---

## Tech Stack

| Layer | Technology | Origem |
|-------|-----------|--------|
| Frontend | React 18 + TypeScript + Vite | Migrado do Myrlin |
| UI Components | shadcn/ui + Tailwind CSS | Novo |
| Terminal UI | xterm.js 5.x | Myrlin (mantido) |
| Backend | Node.js 20 + Express + TypeScript | Myrlin (mantido) |
| WebSocket | ws 8.x | Myrlin (mantido) |
| PTY | node-pty 1.x | Myrlin (mantido) |
| Worktree pool | Padrão do Dash | Novo |
| File watching | chokidar 3.x | Novo |
| Markdown | react-markdown + rehype-highlight | Novo |
| Diagramas | Reactflow (pipeline visual) | Novo |
| Timeline | vis-timeline ou custom canvas | Novo |
| State | Zustand | Novo |

---

## Waves de Desenvolvimento

| Wave | Stories | Foco | Pode iniciar quando |
|------|---------|------|---------------------|
| Wave 1 | AB-1 | Fundação (fork + setup) | Agora |
| Wave 2 | AB-2, AB-5 | Terminal Engine + Kanban (paralelo) | AB-1 Done |
| Wave 3 | AB-3 | AIOS Master Hub | AB-2 Done |
| Wave 4 | AB-4, AB-6 | Pipeline Visual + Waves View (paralelo) | AB-3 + AB-5 Done |
| Wave 5 | AB-7 | Yolo Mode | AB-3 Done |

---

## Dependencies

| Dependency | Status |
|------------|--------|
| Myrlin's Workbook (fork base) | ✅ Open source MIT |
| Node.js 20+ | ✅ Verificar |
| node-pty build tools (Windows) | ⚠️ Requer Visual C++ Build Tools |
| `.aios/hub-stories.json` | ✅ Existe no HUB |
| `docs/stories/` estrutura | ✅ Existe |

---

## Risk Mitigation

| Risk | P | I | Mitigação |
|------|---|---|-----------|
| node-pty no Windows | Alta | Alta | Verificar build tools em AB-1; fallback para spawn básico |
| Reactflow licença | Baixa | Média | Verificar licença MIT antes de AB-4 |
| Myrlin sem manutenção ativa | Média | Média | Fork completo — independência total do upstream |
| Performance com muitos terminais | Média | Alta | Reserve pool (AB-2) + lazy render de terminais não focados |
| Detecção de handoff — falsos positivos | Média | Média | Modo Suggest como default; regex testável no Settings |

---

## Definition of Done

- [ ] AB-1 a AB-7 completas com ACs atendidos
- [ ] AIOS Master Hub vê output de todos os agentes em tempo real
- [ ] SDC Pipeline visual mostra posição atual de cada story
- [ ] Kanban reflete estado real dos arquivos `.md`
- [ ] Waves view mostra progresso do epic
- [ ] Yolo Mode detecta handoff e abre nova sessão
- [ ] `npm run dev` inicia tudo localmente
- [ ] Nenhuma modificação no AIOS HUB existente

---

## Change Log

| Date | Version | Description |
|------|---------|-------------|
| 2026-03-03 | 1.0 | Epic inicial criado |
| 2026-03-03 | 2.0 | Reescrito com visão completa: Master Hub + kb visual + fork Myrlin + waves |
