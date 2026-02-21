# Browser Automate Task

> Automação de browser AGÊNTICA - navegação complexa, formulários, multi-passo, interação humana-like.

**Comando:** `*browser`

---

## Quando Usar

| Use `*browser` | Use MCP GLM Search |
|----------------|-------------------|
| Preencher formulários complexos | Pesquisas simples |
| Navegação multi-passo | Encontrar informações |
| Testar fluxos de UI | Ler documentação |
| Interagir com elementos | Buscar notícias |
| Login + navegação | Pesquisa de mercado |
| Extrair dados com interação | Web scraping simples |
| Trabalhar em apps web | Consultas rápidas |

**Regra:** Se precisa **clicar, digitar, navegar entre páginas** → `*browser`. Se só precisa **pesquisar** → MCP GLM.

---

## Como Invocar

```bash
# Uso agêntico (AI decide os passos)
*browser run "Fazer login no Notion e criar uma página com título X"
*browser run "Preencher formulário de cadastro com dados de teste"
*browser run "Navegar até configurações e exportar dados"

# Uso manual (você controla passo a passo)
*browser open https://site.com
*browser state
*browser input 0 "texto"
*browser click 5
*browser close
```

---

## Casos de Uso Agênticos

### 1. Fluxos Complexos
```bash
*browser run "No Salesforce, encontrar o contato João Silva e atualizar o telefone para 11999999999"
```

### 2. Testes E2E
```bash
*browser run "Testar o fluxo completo de compra: adicionar produto ao carrinho, ir para checkout, preencher endereço, verificar se chegou na página de confirmação"
```

### 3. Formulários
```bash
*browser run "Preencher o formulário de contato em example.com/contato com nome João, email joao@teste.com e mensagem 'Teste de automação'"
```

### 4. Extração com Interação
```bash
*browser run "Logar no portal do cliente, navegar até Faturas, baixar a última fatura em PDF"
```

### 5. Validação de UI
```bash
*browser run "Verificar se o botão 'Comprar' está visível e habilitado na página do produto X"
```

---

## Task Definition

```yaml
task: browserAutomate()
command: *browser
responsavel: Multi-agente (analyst, dev, qa, devops, pm, ux-design-expert)
responsavel_type: Ferramenta Compartilhada
atomic_layer: Infrastructure
elicit: false

**Entrada:**
- campo: action
  tipo: string
  origem: Agent Decision
  obrigatorio: true
  validacao: open|state|click|type|input|screenshot|run|close|eval|extract

- campo: target_url
  tipo: string
  origem: Agent Input
  obrigatorio: false
  validacao: URL valida (requerido para action=open)

- campo: element_index
  tipo: integer
  origem: browser-use state output
  obrigatorio: false
  validacao: Indice de elemento valido (requerido para click, input)

- campo: text_input
  tipo: string
  origem: Agent Input
  obrigatorio: false
  validacao: Texto para digitar (requerido para type, input)

- campo: task_description
  tipo: string
  origem: Agent Input
  obrigatorio: false
  validacao: Descricao da tarefa em linguagem natural (requerido para run, extract)

- campo: browser_mode
  tipo: string
  origem: Agent Decision
  obrigatorio: false
  default: chromium
  validacao: chromium|real|remote

- campo: session_name
  tipo: string
  origem: Agent Decision
  obrigatorio: false
  default: default
  validacao: Nome da sessao para paralelismo

**Saida:**
- campo: result
  tipo: string|json
  destino: Console output
  persistido: false

- campo: screenshot_path
  tipo: string
  destino: File system
  persistido: true
```

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] Python 3.11+ instalado
    tipo: pre-condition
    blocker: true
    validacao: python --version retorna 3.11+
    error_message: "Instale Python 3.11+: https://python.org"

  - [ ] browser-use instalado no AIOS
    tipo: pre-condition
    blocker: true
    validacao: D:/workspace/.aios-tools/browser-use/.venv existe
    error_message: "Execute: cd D:/workspace/.aios-tools/browser-use && source .venv/Scripts/activate && browser-use install"
```

## AIOS Environment Setup

O browser-use está instalado em:
```
D:/workspace/.aios-tools/browser-use/
├── .venv/              # Virtual environment
├── bu.cmd              # Windows wrapper
└── bu.sh               # Bash wrapper
```

### Como Usar (Bash/Git Bash)

```bash
# Ativar ambiente e usar
cd D:/workspace/.aios-tools/browser-use
source .venv/Scripts/activate
PYTHONIOENCODING=utf-8 browser-use <command>

# Ou usar o wrapper
./bu.sh open https://example.com
```

### Como Usar (Windows CMD)

```cmd
cd D:\workspace\.aios-tools\browser-use
bu.cmd open https://example.com
```

---

## Browser Modes

| Modo | Flag | Descricao | Uso Recomendado |
|------|------|-----------|-----------------|
| **chromium** | `--browser chromium` | Headless Chromium, rapido e isolado | Automacao geral, testes |
| **real** | `--browser real` | Chrome do usuario com cookies/logins | Sites que precisam autenticacao |
| **remote** | `--browser remote` | Cloud browser com proxy | CI/CD, stealth, multi-regiao |

---

## Core Workflow

```
1. NAVIGATE   → browser-use open <url>
2. INSPECT    → browser-use state
3. INTERACT   → browser-use click <index> | browser-use input <index> "text"
4. VERIFY     → browser-use state | browser-use screenshot
5. REPEAT     → Browser permanece aberto entre comandos
6. CLEANUP    → browser-use close
```

---

## Commands Reference

### Navigation
```bash
browser-use open <url>              # Navegar para URL
browser-use back                    # Voltar no historico
browser-use scroll down             # Rolar para baixo
browser-use scroll up               # Rolar para cima
browser-use scroll down --amount 1000  # Rolar pixels especificos
```

### Page State
```bash
browser-use state                   # URL, titulo e elementos clicaveis
browser-use screenshot              # Screenshot (base64)
browser-use screenshot path.png     # Salvar screenshot em arquivo
browser-use screenshot --full path.png  # Full page screenshot
```

### Interactions (indices do `state`)
```bash
browser-use click <index>           # Clicar elemento
browser-use type "texto"            # Digitar no elemento focado
browser-use input <index> "texto"   # Clicar e digitar
browser-use keys "Enter"            # Enviar tecla
browser-use keys "Control+a"        # Combinacao de teclas
browser-use select <index> "opcao"  # Selecionar dropdown
browser-use hover <index>           # Hover sobre elemento
browser-use dblclick <index>        # Double-click
browser-use rightclick <index>      # Right-click (context menu)
```

### JavaScript & Data
```bash
browser-use eval "document.title"   # Executar JavaScript
browser-use extract "todos os precos"  # Extrair dados com LLM
```

### Python (Persistent Session)
```bash
browser-use python "x = 42"
browser-use python "print(x)"       # Acessa variaveis da sessao
browser-use python "print(browser.url)"
browser-use python --file script.py # Executar arquivo Python
```

### Agent Tasks (AI Autonomo)
```bash
browser-use run "Preencher formulario"        # AI agent autonomo
browser-use run "Extrair precos" --max-steps 50
browser-use -b remote run "Pesquisar" --no-wait  # Async
```

### Sessions
```bash
browser-use --session trabalho open <url>  # Sessao nomeada
browser-use --session trabalho state       # Verificar sessao
browser-use sessions                       # Listar sessoes
browser-use close                          # Fechar sessao atual
browser-use close --all                    # Fechar todas
```

---

## Agent Usage Patterns

### @analyst - Pesquisa e Coleta de Dados

```bash
# Pesquisar e extrair informacoes
browser-use open https://exemplo.com/pesquisa
browser-use run "Encontrar e extrair os 5 artigos mais recentes com seus titulos e links"

# Usar modo remote para evitar bloqueios
browser-use -b remote run "Pesquisar precos de produto X em 3 sites diferentes"
```

### @dev - Testes de Interface e Debugging

```bash
# Testar interface local
browser-use open http://localhost:3000
browser-use state
browser-use screenshot dev-test.png

# Testar formulario
browser-use input 0 "teste@exemplo.com"
browser-use input 1 "senha123"
browser-use click 2
browser-use state  # Verificar resultado
```

### @qa - Testes E2E e Validacao

```bash
# Fluxo de teste completo
browser-use open https://app.exemplo.com/login
browser-use state
browser-use input 0 "usuario@teste.com"
browser-use input 1 "senha123"
browser-use click 2
browser-use wait text "Dashboard"
browser-use screenshot login-success.png
browser-use eval "document.querySelector('.user-name').textContent"
browser-use close
```

### @devops - Monitoramento e Deploy Visual

```bash
# Verificar deploy
browser-use open https://producao.exemplo.com/health
browser-use screenshot health-check.png
browser-use eval "document.body.innerText"

# Monitorar multiplas URLs
browser-use --session monitor1 open https://site1.com/status
browser-use --session monitor2 open https://site2.com/status
```

### @pm - Demonstracoes e Prototipos

```bash
# Capturar screens para apresentacao
browser-use --headed open https://prototipo.exemplo.com
browser-use screenshot --full slide-01.png
browser-use click 3
browser-use screenshot --full slide-02.png
```

### @ux-design-expert - Analise de Interfaces

```bash
# Analisar UI/UX
browser-use --headed open https://concorrente.com
browser-use screenshot --full analise-competidor.png
browser-use eval "
  Array.from(document.querySelectorAll('button'))
    .map(b => ({text: b.innerText, color: getComputedStyle(b).backgroundColor}))
"
```

---

## Implementation Steps

### 1. Verify Pre-conditions

```bash
# Check Python
python --version  # Should be 3.11+

# Check uv
uv --version

# Check browser-use (install if needed)
uv pip install "browser-use[cli]"
browser-use install
```

### 2. Start Browser Session

```bash
# Basic navigation
browser-use open https://exemplo.com

# With specific mode
browser-use --browser real open https://site-que-precisa-login.com

# With session name (for parallel work)
browser-use --session pesquisa open https://site1.com
```

### 3. Inspect Page State

```bash
# Always run state first to see available elements
browser-use state

# Output example:
# URL: https://exemplo.com
# Title: Example Site
# Elements:
# [0] input "Search"
# [1] button "Submit"
# [2] a "About Us"
```

### 4. Interact with Elements

```bash
# Use indices from state output
browser-use input 0 "termo de busca"
browser-use click 1

# Or use AI agent for complex tasks
browser-use run "Preencher o formulario de contato com dados de teste"
```

### 5. Verify Results

```bash
# Check state after actions
browser-use state

# Take screenshot for evidence
browser-use screenshot resultado.png
```

### 6. Cleanup

```bash
# Always close browser when done
browser-use close

# Or close all sessions
browser-use close --all
```

---

## Advanced Usage

### Running Parallel Agents (Remote Mode)

```bash
# Launch parallel tasks
browser-use -b remote run "Pesquisar produto A" --no-wait
# → task_id: task-1, session_id: sess-a

browser-use -b remote run "Pesquisar produto B" --no-wait
# → task_id: task-2, session_id: sess-b

# Monitor tasks
browser-use task list --status running

# Get results
browser-use task status task-1
browser-use task status task-2

# Cleanup
browser-use session stop --all
```

### Using Real Chrome Profile

```bash
# List available profiles
browser-use -b real profile list

# Use specific profile (has that profile's cookies/logins)
browser-use --browser real --profile "Default" open https://gmail.com

# Without profile (fresh browser)
browser-use --browser real open https://gmail.com
```

### Exposing Local Dev Server to Cloud

```bash
# Start dev server
npm run dev &  # localhost:3000

# Create tunnel
browser-use tunnel 3000
# → url: https://abc.trycloudflare.com

# Browse with cloud browser
browser-use --browser remote open https://abc.trycloudflare.com
```

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] Browser session closed
    tipo: post-condition
    blocker: false
    validacao: browser-use close executado
    error_message: "Execute browser-use close para liberar recursos"

  - [ ] Evidence captured
    tipo: post-condition
    blocker: false
    validacao: Screenshots ou dados extraidos salvos
    error_message: "Considere capturar screenshot ou extrair dados"
```

---

## Error Handling

### Browser Won't Start

```bash
# Diagnosis
browser-use doctor

# Reinstall Chromium
browser-use install

# Stop stuck server
browser-use server stop

# Try with visible window
browser-use --headed open <url>
```

### Element Not Found

```bash
# Check current elements
browser-use state

# Element might be below fold
browser-use scroll down
browser-use state

# Wait for element
browser-use wait selector ".element-class"
```

### Session Issues

```bash
# Check active sessions
browser-use sessions

# Clean slate
browser-use close --all

# Fresh start
browser-use open <url>
```

### Remote Mode Issues

```bash
# Check API key
echo $BROWSER_USE_API_KEY

# Configure API key
mkdir -p ~/.config/browser-use
echo '{"api_key": "your-key"}' > ~/.config/browser-use/config.json

# Check task status
browser-use task status <task-id>
```

---

## API Key Configuration

Para recursos avancados (`run`, `extract`, `--browser remote`):

```bash
# Environment variable
export BROWSER_USE_API_KEY="sua-key"

# Or config file
mkdir -p ~/.config/browser-use
echo '{"api_key": "sua-key"}' > ~/.config/browser-use/config.json
```

---

## Examples

### Form Submission

```bash
browser-use open https://exemplo.com/contato
browser-use state
# [0] input "Nome", [1] input "Email", [2] textarea "Mensagem", [3] button "Enviar"

browser-use input 0 "Joao Silva"
browser-use input 1 "joao@exemplo.com"
browser-use input 2 "Mensagem de teste"
browser-use click 3
browser-use state  # Verify success
browser-use close
```

### Data Extraction with AI

```bash
browser-use open https://exemplo.com/produtos
browser-use run "Extrair nome, preco e disponibilidade de todos os produtos listados"
browser-use close
```

### Multi-Session Workflow

```bash
# Research in parallel
browser-use --session pesquisa1 open https://site1.com
browser-use --session pesquisa2 open https://site2.com

browser-use --session pesquisa1 state
browser-use --session pesquisa2 state

browser-use close --all
```

### Screenshot Loop for Documentation

```bash
browser-use open https://exemplo.com
for i in 1 2 3 4 5; do
  browser-use scroll down
  browser-use screenshot "page_$i.png"
done
browser-use close
```

---

## Tips

1. **Sempre `browser-use state` primeiro** - veja os elementos e indices
2. **`--headed` para debug** - veja o que o browser esta fazendo
3. **Sessoes persistem** - browser fica aberto entre comandos
4. **`--json` para parsing** - saida estruturada
5. **Python persiste** - variaveis mantidas entre comandos
6. **`--browser real`** - preserva logins e extensoes
7. **Aliases**: `bu`, `browser`, `browseruse` funcionam igual

---

## Metadata

```yaml
task: browser-automate
version: 1.0.0
story: AIOS Infrastructure Enhancement
dependencies:
  - Python 3.11+
  - uv
  - browser-use[cli]
tags:
  - automation
  - browser
  - testing
  - scraping
  - ai-agent
created_at: 2026-02-20
updated_at: 2026-02-20
agents:
  - analyst
  - dev
  - qa
  - devops
  - pm
  - ux-design-expert
changelog:
  1.0.0:
    - Initial version
    - Integrated browser-use CLI as AIOS task
    - Added usage patterns for all compatible agents
```
