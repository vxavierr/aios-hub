# Story AB-2: Terminal Engine — Multi-tab com Worktrees

> **Story ID:** AB-2
> **Epic:** BRIDGE-EPIC-1 (AIOS Bridge)
> **Status:** Ready for Review
> **Priority:** P0 — Core do cockpit
> **Estimate:** 6–8 horas
> **Assignee:** @dev
> **Quality Gate:** @architect
> **Wave:** Wave 2 (paralela com AB-5)
> **Blocker:** AB-1 ✅ Done

---

## Description

Implementar o **Terminal Engine** do AIOS Bridge: sistema de multi-tabs onde cada tab é um terminal PTY isolado, rodando em seu próprio git worktree do AIOS Hub. O padrão de **reserve pool** (inspirado no Dash) garante abertura de tabs em < 100ms.

### Context

AB-1 entregou a fundação: React 19 + TypeScript + Vite no frontend, Node.js 22 + Express + WebSocket + node-pty no backend, com PTY básico funcional. Agora construímos sobre essa base para suportar múltiplas tabs simultâneas com isolamento real via git worktrees.

**Gap crítico identificado pelo @architect em AB-1:**
O `PtyManager.resize()` existe no backend mas **nunca é chamado** — o `ResizeObserver` do `useTerminal.ts` chama apenas `fitAddon.fit()` sem enviar o novo tamanho ao backend via WebSocket. AB-2 resolve isso como pré-requisito do protocolo de controle.

**Protocolo WebSocket estendido (AB-2):**
Atualmente o WebSocket transmite apenas texto raw (input do usuário). AB-2 introduz um protocolo de controle baseado em JSON para mensagens estruturadas (resize, status), mantendo compatibilidade retroativa com a transmissão de texto plain.

**Worktrees do AIOS Hub:**
Cada tab abre um shell num worktree isolado de `D:/workspace/` (o AIOS Hub), não do projeto aios-bridge em si. Isso permite que múltiplos agentes Claude Code trabalhem em paralelo sem conflitos de branch. O backend mantém um pool de 3 worktrees pré-criados em `D:/workspace/.bridge-tabs/`.

---

## Acceptance Criteria

```gherkin
Feature: Terminal Engine — Multi-tab com Worktrees

Scenario: Abrir nova tab
  Given a interface está carregada
  When clico no botão "+"
  Then uma nova tab é criada em < 100ms
  And a tab tem um terminal funcional conectado a um PTY
  And o PTY está rodando num worktree isolado do AIOS Hub
  And a tab mostra nome do agente (editável), cor de identificação e status

Scenario: Reserve pool de worktrees
  Given o backend inicializou
  Then 3 worktrees foram pré-criados em D:/workspace/.bridge-tabs/
  And cada worktree tem sua própria branch git (bridge-tab-01, bridge-tab-02, bridge-tab-03)
  When uma nova tab é aberta
  Then o worktree do pool é alocado instantaneamente
  And o pool é reabastecido automaticamente em background

Scenario: Protocolo de resize via WebSocket
  Given um terminal aberto
  When o usuário redimensiona a janela do browser
  Then o FitAddon do xterm.js ajusta o layout do terminal
  And o novo tamanho (cols/rows) é enviado ao backend via WebSocket como JSON: { type: "resize", cols, rows }
  And o backend chama ptyManager.resize(sessionId, cols, rows)
  And o PTY propaga o SIGWINCH ao processo shell
  And o conteúdo do terminal se ajusta corretamente

Scenario: Metadados de tab
  Given uma tab aberta
  Then ela exibe nome do agente (ex: "@dev Dex"), editável por duplo-clique
  And cor de identificação (atribuída automaticamente, 8 opções disponíveis)
  And indicador de status: Active (verde) / Waiting Input (amarelo) / Idle (cinza) / Error (vermelho)
  And nome da branch do worktree

Scenario: Múltiplas tabs em paralelo
  Given o sistema com 3 tabs abertas
  Then cada tab tem PTY e worktree separados
  And cada terminal funciona independentemente (input/output isolados)
  And é possível clicar entre tabs sem perder o conteúdo (scrollback preservado via AB-1)

Scenario: Fechar tab
  Given uma tab aberta
  When clico no "×" da tab
  Then o PTY é encerrado (kill + cleanup)
  And o worktree é resetado (git checkout . && git clean -fd) e retornado ao pool
  And o pool é reabastecido se necessário

Scenario: Limite de tabs
  Given 10 tabs abertas
  When tento abrir uma 11ª tab
  Then vejo um warning: "Máximo de 10 tabs simultâneas"
  And nenhuma nova tab é criada

Scenario: Ctrl+C funcional
  Given um processo rodando num terminal
  When pressiono Ctrl+C no terminal
  Then o sinal SIGINT é enviado ao processo via PTY
  And o processo é interrompido

Scenario: Resize dinâmico (cols/rows)
  Given um terminal aberto
  When o container HTML do terminal muda de tamanho
  Then o xterm.js ajusta via FitAddon
  And o backend recebe o novo tamanho e redimensiona o PTY

Scenario: Security — PTY restrito ao workspace
  Given qualquer tab aberta
  Then o cwd inicial do PTY é o worktree em D:/workspace/.bridge-tabs/tab-{n}/
  And não é possível navegar acima de D:/workspace/ (validação no backend)
```

---

## Scope

### In Scope

- Tab bar com botões + e × (abrir/fechar tabs)
- WorktreePool: pré-criação e gestão de 3 worktrees de D:/workspace/
- TabManager no backend: coordena PTY + worktree + metadados
- Protocolo WebSocket estendido: JSON para controle (resize), texto raw para input PTY
- Resize fix: useTerminal.ts → enviar resize via WebSocket → backend → ptyManager.resize()
- Zustand store para estado das tabs no frontend
- Metadados de tab: nome editável, cor, status, branch name
- Limite de 10 tabs com warning
- Fechar tab: kill PTY + reset worktree + replenish pool
- REST endpoints: GET/POST/DELETE /api/tabs
- Validação de security: cwd restrito a D:/workspace/

### Out of Scope

- AIOS Master Hub (painel central de controle) → AB-3
- Activity Stream e leitura de output de todos os terminais → AB-3
- Kanban de stories → AB-5
- Pipeline visual → AB-4
- Yolo Mode (detecção automática de handoffs) → AB-7
- Persistência de sessões entre reinícios do bridge
- SSH ou conexões remotas

---

## Tasks

- [x] **Adicionar `PtyManager.killSession()` em `pty.ts`** — mata o processo PTY e remove a sessão; necessário para `TabManager.closeTab()` (AC: 6):
  ```typescript
  killSession(sessionId: string) {
    const session = this.sessions.get(sessionId)
    if (!session) return
    session.ptyProcess.kill()
    session.alive = false
    this.sessions.delete(sessionId)
  }
  ```

- [x] **Protocolo WebSocket de controle** — refactor `pty.ts` `attachClient()` para parsear JSON antes de escrever no PTY (AC: 3)
  ```typescript
  // Em pty.ts, substituir a lógica de message handler:
  ws.on('message', (data) => {
    const str = typeof data === 'string' ? data : data.toString()
    try {
      const msg = JSON.parse(str)
      if (msg.type === 'resize') {
        session.ptyProcess.resize(msg.cols, msg.rows)
        return
      }
    } catch { /* não é JSON, tratar como input PTY */ }
    if (session.alive) session.ptyProcess.write(str)
  })
  ```

- [x] **Resize fix no frontend** — `useTerminal.ts`: adicionar `terminal.onResize()` que envia JSON ao backend (AC: 3)
  ```typescript
  terminal.onResize(({ cols, rows }) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'resize', cols, rows }))
    }
  })
  ```

- [x] **Criar `backend/src/types.ts` atualizado** — adicionar `TabInfo`, `WorktreeInfo`, `WsControlMessage` (AC: 4)

- [x] **Criar `backend/src/worktree.ts`** — `WorktreePool` class (AC: 2):
  - `init(hubPath, poolDir, poolSize)` — pré-cria worktrees via `git worktree add`
  - `acquire()` — retorna um worktree do pool (ou cria mais se vazio)
  - `release(id)` — reset do worktree (`git checkout .`, `git clean -fd`) e retorna ao pool
  - `replenish()` — reabastece pool em background até `poolSize`
  - `destroy()` — limpa todos os worktrees ao encerrar o backend

- [x] **Criar `backend/src/tab-manager.ts`** — `TabManager` class (AC: 1, 2, 4, 5):
  - `openTab(opts?)` → cria tab: adquire worktree, spawn PTY no worktree, retorna `TabInfo`
  - `closeTab(tabId)` → encerra PTY, libera worktree
  - `getTab(tabId)` → retorna `TabInfo` com metadados
  - `listTabs()` → lista todas as tabs ativas
  - `updateTabMeta(tabId, { name?, color? })` → atualiza metadados
  - Limita a `MAX_TABS = 10`

- [x] **Atualizar `backend/src/server.ts`** — REST API + integração com TabManager (AC: 1, 6, 7):
  - `POST /api/tabs` → `tabManager.openTab()` → retorna `{ tabId, sessionId, wsUrl, worktreePath, branch }`
  - `GET /api/tabs` → `tabManager.listTabs()`
  - `DELETE /api/tabs/:tabId` → `tabManager.closeTab(tabId)`
  - `PATCH /api/tabs/:tabId` → `tabManager.updateTabMeta()`
  - WebSocket upgrade: extrair `tabId` do query, verificar que tab existe antes de attachar PTY

- [x] **Criar `frontend/src/store/tabs.ts`** — Zustand store (AC: 4, 5):
  ```typescript
  interface Tab {
    id: string
    sessionId: string
    name: string
    color: TabColor
    status: 'active' | 'waiting' | 'idle' | 'error'
    branch: string
    createdAt: number
  }
  interface TabStore {
    tabs: Tab[]
    activeTabId: string | null
    addTab: (tab: Tab) => void
    removeTab: (tabId: string) => void
    setActive: (tabId: string) => void
    updateTab: (tabId: string, patch: Partial<Tab>) => void
  }
  ```

- [x] **Criar `frontend/src/features/tabs/TabBar.tsx`** — componente de tab bar (AC: 1, 4, 6):
  - Render de tabs com nome editável (duplo-clique → input inline)
  - Botão + para nova tab (desabilitado com tooltip se ≥10 tabs)
  - Botão × para fechar tab
  - Indicador de status colorido por tab
  - Branch name como badge pequeno

- [x] **Criar `frontend/src/features/tabs/useTabManager.ts`** — hook para operações de tab (AC: 1, 5, 6, 7):
  - `openTab()` → POST /api/tabs → adiciona ao Zustand store → retorna tabId
  - `closeTab(tabId)` → DELETE /api/tabs/:tabId → remove do store
  - `setActiveTab(tabId)` → atualiza store
  - Polling leve de GET /api/tabs para sincronizar status (ou EventSource em versão futura)

- [x] **Atualizar `frontend/src/App.tsx`** — layout multi-tab (AC: 1, 5):
  - Header com TabBar
  - Main area mostra `<TerminalView>` da tab ativa
  - Montar/desmontar TerminalView dinamicamente por tab (ou usar `display:none` para preservar xterm)
  - Warning toast quando tentativa de abrir 11ª tab

- [x] **Criar diretório `D:/workspace/.bridge-tabs/`** — validar que o backend cria automaticamente ao inicializar `WorktreePool`

- [x] **Instalar `zustand`** no frontend (AC: store)
  ```bash
  cd frontend && npm install zustand
  ```

- [ ] **Smoke test completo** (AC: todos):
  - Abrir 3 tabs → cada uma em worktree diferente
  - Verificar: `git branch` em cada tab mostra branch isolada
  - Redimensionar window → verificar resize no terminal (sem truncamento)
  - Fechar tab → verificar que PTY morreu e worktree voltou ao pool
  - Abrir 10 tabs → tentar 11ª → ver warning

---

## File List

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `projects/aios-bridge/backend/src/pty.ts` | Modificar | Protocolo WS: parse JSON para resize, mantém raw text para input |
| `projects/aios-bridge/backend/src/types.ts` | Modificar | Adicionar TabInfo, WorktreeInfo, WsControlMessage |
| `projects/aios-bridge/backend/src/worktree.ts` | Criar | WorktreePool: pré-criação, acquire, release, replenish |
| `projects/aios-bridge/backend/src/tab-manager.ts` | Criar | TabManager: lifecycle de tabs (open/close/list/meta) |
| `projects/aios-bridge/backend/src/server.ts` | Modificar | REST /api/tabs (CRUD) + integração TabManager |
| `projects/aios-bridge/frontend/src/store/tabs.ts` | Criar | Zustand store: estado global das tabs |
| `projects/aios-bridge/frontend/src/features/tabs/TabBar.tsx` | Criar | Componente tab bar com +/× e metadados |
| `projects/aios-bridge/frontend/src/features/tabs/useTabManager.ts` | Criar | Hook para operações de tab (open/close/sync) |
| `projects/aios-bridge/frontend/src/features/terminal/useTerminal.ts` | Modificar | Resize fix: terminal.onResize → ws.send JSON |
| `projects/aios-bridge/frontend/src/App.tsx` | Modificar | Layout multi-tab: TabBar + TerminalView dinâmico |
| `D:/workspace/.bridge-tabs/` | Criar (runtime) | Diretório pool de worktrees (criado pelo backend, não versionado) |

---

## Dev Notes

### Contexto de AB-1 — O que existe (não quebrar)

**Backend `pty.ts`** — `PtyManager`:
- `attachClient(sessionId, ws, opts)` — cria ou reuса sessão PTY, envia scrollback, registra handlers
- `resize(sessionId, cols, rows)` — método existe mas **nunca chamado via WebSocket** → fix em AB-2
- `list()` — retorna `PtySessionInfo[]`
- Scrollback: 100KB por sessão, enviado ao novo cliente ao conectar

**Backend `server.ts`**:
- WS upgrade em `/ws?sessionId=...&cols=...&rows=...`
- `sessionId` é gerado no frontend se não fornecido

**Frontend `useTerminal.ts`**:
- `ResizeObserver` → `fitAddon.fit()` (ajusta xterm) mas NÃO envia para backend → fix em AB-2
- Sessão xterm.js com tema Catppuccin Mocha completo

**Frontend `App.tsx`**:
- Único `<TerminalView>` hardcoded — será substituído pelo layout multi-tab

### Protocolo WebSocket Estendido (AB-2)

**Direção Client → Server:**
```typescript
// Input PTY (texto raw — existente, mantido)
ws.send("ls -la\r")

// Mensagem de controle (nova)
ws.send(JSON.stringify({ type: 'resize', cols: 220, rows: 50 }))
```

**Backend parser (em `pty.ts`):**
```typescript
ws.on('message', (data: Buffer | string) => {
  const str = typeof data === 'string' ? data : data.toString()
  // Tenta parsear como JSON primeiro
  try {
    const msg = JSON.parse(str)
    if (msg.type === 'resize' && typeof msg.cols === 'number' && typeof msg.rows === 'number') {
      session.ptyProcess.resize(msg.cols, msg.rows)
      return
    }
  } catch { /* não é JSON */ }
  // Texto raw → input PTY
  if (session.alive) {
    session.ptyProcess.write(str)
  }
})
```

### WorktreePool — Implementação Referência

```typescript
// backend/src/worktree.ts
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const HUB_PATH = 'D:/workspace'
const POOL_DIR = path.join(HUB_PATH, '.bridge-tabs')
const POOL_SIZE = 3
const BRANCH_PREFIX = 'bridge-tab'

export class WorktreePool {
  private available: string[] = []  // worktree IDs disponíveis
  private inUse: Map<string, string> = new Map()  // tabId → worktreePath

  async init() {
    fs.mkdirSync(POOL_DIR, { recursive: true })
    for (let i = 1; i <= POOL_SIZE; i++) {
      await this.createWorktree(i)
    }
  }

  private async createWorktree(n: number) {
    const id = String(n).padStart(2, '0')
    const worktreePath = path.join(POOL_DIR, `tab-${id}`)
    const branchName = `${BRANCH_PREFIX}-${id}`
    if (fs.existsSync(worktreePath)) {
      this.available.push(id)
      return
    }
    try {
      execSync(`git -C "${HUB_PATH}" worktree add "${worktreePath}" -B ${branchName}`, {
        stdio: 'pipe'
      })
      this.available.push(id)
    } catch (e) {
      console.error(`[WorktreePool] Failed to create worktree ${id}:`, e)
    }
  }

  acquire(tabId: string): string | null {
    const id = this.available.shift()
    if (!id) return null
    const worktreePath = path.join(POOL_DIR, `tab-${id}`)
    this.inUse.set(tabId, worktreePath)
    this.replenish()  // async — não bloqueia
    return worktreePath
  }

  release(tabId: string) {
    const worktreePath = this.inUse.get(tabId)
    if (!worktreePath) return
    this.inUse.delete(tabId)
    try {
      // Reset do worktree para estado limpo
      execSync(`git -C "${worktreePath}" checkout .`, { stdio: 'pipe' })
      execSync(`git -C "${worktreePath}" clean -fd`, { stdio: 'pipe' })
    } catch { /* worktree pode estar em estado inválido */ }
    const id = path.basename(worktreePath).replace('tab-', '')
    this.available.push(id)
  }

  private async replenish() {
    const total = this.available.length + this.inUse.size
    for (let n = total + 1; this.available.length < POOL_SIZE; n++) {
      await this.createWorktree(n)
    }
  }

  destroy() {
    for (const id of [...this.available, ...this.inUse.keys()]) {
      const worktreePath = path.join(POOL_DIR, `tab-${String(id).padStart(2, '0')}`)
      try {
        execSync(`git -C "${HUB_PATH}" worktree remove --force "${worktreePath}"`, { stdio: 'pipe' })
      } catch {}
    }
  }
}
```

### TabManager — Estrutura

```typescript
// backend/src/tab-manager.ts
export const TAB_COLORS = ['blue', 'green', 'yellow', 'red', 'purple', 'cyan', 'orange', 'pink'] as const
export type TabColor = typeof TAB_COLORS[number]
export const MAX_TABS = 10

export interface TabInfo {
  tabId: string
  sessionId: string
  name: string
  color: TabColor
  status: 'active' | 'waiting' | 'idle' | 'error'
  branch: string
  worktreePath: string
  createdAt: number
}

export class TabManager {
  private tabs: Map<string, TabInfo> = new Map()
  constructor(private ptyManager: PtyManager, private worktreePool: WorktreePool) {}

  openTab(opts?: { name?: string }): TabInfo | null {
    if (this.tabs.size >= MAX_TABS) return null

    const tabId = `tab-${Date.now()}`
    const sessionId = `pty-${tabId}`
    const worktreePath = this.worktreePool.acquire(tabId)
    if (!worktreePath) return null

    const colorIndex = this.tabs.size % TAB_COLORS.length
    const branch = `bridge-tab-${path.basename(worktreePath).replace('tab-', '')}`

    const info: TabInfo = {
      tabId,
      sessionId,
      name: opts?.name ?? `Tab ${this.tabs.size + 1}`,
      color: TAB_COLORS[colorIndex],
      status: 'active',
      branch,
      worktreePath,
      createdAt: Date.now()
    }

    this.tabs.set(tabId, info)
    return info
  }

  closeTab(tabId: string) {
    const tab = this.tabs.get(tabId)
    if (!tab) return
    // Kill PTY session
    this.ptyManager.killSession(tab.sessionId)
    // Return worktree to pool
    this.worktreePool.release(tabId)
    this.tabs.delete(tabId)
  }
}
```

**Nota:** `PtyManager.killSession()` precisa ser adicionado em `pty.ts` — mata o processo PTY e remove a sessão.

### Zustand Store (Frontend)

```typescript
// frontend/src/store/tabs.ts
import { create } from 'zustand'

export type TabStatus = 'active' | 'waiting' | 'idle' | 'error'
export const TAB_COLORS = ['blue','green','yellow','red','purple','cyan','orange','pink'] as const
export type TabColor = typeof TAB_COLORS[number]

export interface Tab {
  id: string        // tabId do backend
  sessionId: string // usado no ws?sessionId=...
  name: string
  color: TabColor
  status: TabStatus
  branch: string
  createdAt: number
}

interface TabStore {
  tabs: Tab[]
  activeTabId: string | null
  addTab: (tab: Tab) => void
  removeTab: (tabId: string) => void
  setActive: (tabId: string) => void
  updateTab: (tabId: string, patch: Partial<Tab>) => void
}

export const useTabStore = create<TabStore>((set) => ({
  tabs: [],
  activeTabId: null,
  addTab: (tab) => set((s) => ({
    tabs: [...s.tabs, tab],
    activeTabId: tab.id,
  })),
  removeTab: (tabId) => set((s) => {
    const tabs = s.tabs.filter((t) => t.id !== tabId)
    const activeTabId = s.activeTabId === tabId
      ? (tabs[tabs.length - 1]?.id ?? null)
      : s.activeTabId
    return { tabs, activeTabId }
  }),
  setActive: (tabId) => set({ activeTabId: tabId }),
  updateTab: (tabId, patch) => set((s) => ({
    tabs: s.tabs.map((t) => t.id === tabId ? { ...t, ...patch } : t),
  })),
}))
```

### Montagem de TerminalView por Tab

**Estratégia:** Manter todos os `<TerminalView>` montados (preserva xterm + scrollback), usar `hidden` no CSS para ocultar tabs inativas:

```tsx
// App.tsx (simplificado)
{tabs.map((tab) => (
  <div
    key={tab.id}
    className={cn('flex-1 overflow-hidden', tab.id !== activeTabId && 'hidden')}
  >
    <TerminalView
      socketUrl={WS_URL}
      sessionId={tab.sessionId}
    />
  </div>
))}
```

Isso preserva o estado do xterm e o scrollback sem precisar reconectar ao backend.

### Security: Validação de cwd no Backend

```typescript
// Em tab-manager.ts e/ou worktree.ts
const ALLOWED_CWD_PREFIX = 'D:/workspace'

function validateCwd(cwd: string): boolean {
  const normalized = path.normalize(cwd).replace(/\\/g, '/')
  return normalized.startsWith(ALLOWED_CWD_PREFIX.replace(/\\/g, '/'))
}
```

Ao spawnar PTY, rejeitar qualquer `cwd` que não esteja sob `D:/workspace/`.

### Testing

Não há testes unitários automatizados nesta story — o projeto não tem framework de testes configurado. A validação é feita via **smoke test manual** descrito na seção Tasks:

- Rodar backend + frontend com `npm run dev`
- Executar todos os cenários do smoke test (abrir 3 tabs, resize, fechar, limite de 10)
- Verificar isolamento via `git branch` em cada tab
- Verificar ausência de processos zumbi via `tasklist | grep node`
- Verificar que `D:/workspace/.bridge-tabs/` foi criado automaticamente

Quando o projeto ganhar cobertura de testes em stories futuras, esta seção deve ser atualizada.

### git worktree — Notas Windows

- Usar `git -C "D:/workspace"` para rodar git no contexto do hub
- Paths Windows com espaços: envolver em aspas duplas
- `execSync` com `stdio: 'pipe'` para capturar erros sem poluir stdout
- Em Windows, `git worktree remove` pode falhar se há arquivos locked → usar `--force`
- **Branch `-B` vs `-b`**: `-B` cria ou reseta a branch existente (mais seguro para replenish)

---

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> CodeRabbit CLI não está habilitado em `core-config.yaml`.
> Revisão de qualidade será feita via `@architect` (architecture_review, security_review, performance_review) conforme definido no epic BRIDGE-EPIC-1.

---

## QA Notes

- `@architect` executará: `architecture_review`, `security_review`, `performance_review`
- Verificar que abrir tab em < 100ms quando pool tem worktrees disponíveis
- Verificar que resize propaga corretamente: redimensionar janela → PTY deve mostrar linha inteira sem truncamento
- Verificar que fechar tab mata o PTY (sem processos zumbi — verificar `tasklist` no Windows)
- Verificar que o pool se reabastesce automaticamente após tab fechada
- Verificar limite de 10 tabs: tentar abrir 11ª → ver toast/warning sem crash
- Verificar isolamento: escrever arquivo em tab-01 → não aparece em tab-02
- Verificar security: tentar `cd ..` até sair de D:/workspace → não deve funcionar (cwd não é enforced pelo OS, mas o PTY parte de cwd correto)
- Testar Ctrl+C em processo longo → sinal SIGINT enviado corretamente via PTY
- Verificar scroll history: scroll up → histórico preservado (scrollback de 100KB do AB-1)

---

## Risks

| Risco | P | I | Mitigação |
|-------|---|---|-----------|
| `git worktree add` falha no Windows com paths longos | Média | Alta | Usar `.bridge-tabs/` curto; testar em AB-1 se path limit é issue |
| WorktreePool init lento no startup (3 worktrees síncronos) | Baixa | Média | Usar `Promise.allSettled` para criar em paralelo; aceitar startup +2s |
| Processos PTY zumbi ao fechar tab abruptamente | Média | Média | `ptyProcess.kill()` + cleanup no `onExit`; verificar via tasklist |
| xterm.js com `display:none` pode ter bugs de resize ao reativar | Média | Baixa | Chamar `fitAddon.fit()` ao ativar tab (listener em `setActive`) |
| Pool replenish race condition (dois acquires simultâneos) | Baixa | Média | `available.shift()` é síncrono em Node.js single-thread — seguro |
| branch `bridge-tab-N` já existe no hub (de sessão anterior) | Média | Baixa | Usar `-B` no `git worktree add` (cria ou reseta) |

---

## Definition of Done

- [ ] Protocolo WebSocket de controle implementado (JSON para resize, raw para input)
- [ ] Resize fix: useTerminal.ts envia resize ao backend, backend propaga ao PTY
- [ ] WorktreePool funcional: pré-cria 3 worktrees em `D:/workspace/.bridge-tabs/`
- [ ] TabManager implementado: open/close/list/meta com limite de 10 tabs
- [ ] REST endpoints /api/tabs funcionais
- [ ] Zustand store gerenciando estado das tabs no frontend
- [ ] TabBar.tsx com +/× e metadados (nome, cor, status, branch)
- [ ] App.tsx renderiza múltiplas tabs com isolamento correto
- [ ] Fechar tab: PTY morto + worktree resetado + pool reposto
- [ ] Smoke test: 3 tabs abertas, cada uma em branch isolada (verificado via `git branch`)
- [ ] Resize funcional: redimensionar window → terminal ajusta sem truncamento
- [ ] Ctrl+C encerra processo no terminal
- [ ] @architect review: architecture_review ✅ | security_review ✅ | performance_review ✅

---

## Dev Agent Record

### Agent Model Used
claude-sonnet-4-6

### Completion Notes
- Todos os 12 tasks implementados. TypeScript check passa em backend e frontend.
- ESLint: apenas erro pré-existente no tailwind.config.ts (require import — existia no AB-1).
- Smoke test manual necessário para validar worktrees no ambiente real.
- Security: `validateCwd()` implementado em `worktree.ts`, aplicado no WS upgrade de `server.ts`.
- Worktree pool: `Promise.allSettled` usado para fault isolation no init (não paralelismo real — execSync bloqueia, mas falhas individuais não abortam o init).

### File List
| Arquivo | Ação |
|---------|------|
| `projects/aios-bridge/backend/src/pty.ts` | Modificado |
| `projects/aios-bridge/backend/src/types.ts` | Modificado |
| `projects/aios-bridge/backend/src/worktree.ts` | Criado |
| `projects/aios-bridge/backend/src/tab-manager.ts` | Criado |
| `projects/aios-bridge/backend/src/server.ts` | Modificado |
| `projects/aios-bridge/frontend/src/store/tabs.ts` | Criado |
| `projects/aios-bridge/frontend/src/features/tabs/TabBar.tsx` | Criado |
| `projects/aios-bridge/frontend/src/features/tabs/useTabManager.ts` | Criado |
| `projects/aios-bridge/frontend/src/features/terminal/useTerminal.ts` | Modificado |
| `projects/aios-bridge/frontend/src/features/terminal/TerminalView.tsx` | Modificado |
| `projects/aios-bridge/frontend/src/App.tsx` | Modificado |

## Change Log

| Data | Agente | Mudança |
|------|--------|---------|
| 2026-03-03 | @sm River | Story criada a partir do epic BRIDGE-EPIC-1 — Status: Draft |
| 2026-03-03 | @po Pax | Validação GO Condicional (8/10) → fixes aplicados: killSession() task, seção Testing, versões React 19/Node 22 confirmadas — Status: Ready |
| 2026-03-04 | @dev Dex | Implementação completa: backend (pty+killSession, WorktreePool, TabManager, REST /api/tabs), frontend (Zustand store, TabBar, useTabManager, resize fix, App multi-tab) — Status: Ready for Review |

---

*Story criada por @sm River | Epic BRIDGE-EPIC-1 (AIOS Bridge)*
*Synkra AIOS v4*
