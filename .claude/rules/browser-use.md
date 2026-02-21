# Browser-Use — Uso Agêntico no AIOS

> Automação de browser com AI para tarefas complexas que exigem navegação, cliques e interação.

---

## Quando Usar

| `*browser` (Agêntico) | MCP GLM Search |
|----------------------|----------------|
| Preencher formulários | Pesquisas simples |
| Navegação multi-passo | Encontrar informações |
| Testar fluxos de UI | Ler documentação |
| Login + navegação | Consultas rápidas |
| Extrair dados com interação | Web scraping simples |

**Regra de Ouro:** Precisa **interagir** com a página? → `*browser`. Só precisa **pesquisar**? → MCP GLM.

---

## Comandos Agênticos

```bash
# AI executa autonomamente (PREFERIR ESTE)
*browser run "Fazer login no Notion e criar página X"
*browser run "Preencher formulário de cadastro com dados de teste"
*browser run "Navegar até configurações e exportar dados"
*browser run "Testar fluxo de compra completo"

# Controle manual (quando precisar de precisão)
*browser open https://site.com
*browser state
*browser input 0 "texto"
*browser click 5
*browser close
```

---

## Casos de Uso por Agente

### @qa - Testes E2E
```bash
*browser run "Testar fluxo de login: abrir página, preencher credenciais, verificar se dashboard carregou"
*browser run "Testar checkout: adicionar produto, preencher endereço, verificar página de confirmação"
```

### @dev - Debugging de UI
```bash
*browser open http://localhost:3000
*browser state
*browser screenshot bug-evidencia.png
*browser run "Verificar se o modal abre ao clicar no botão 'Novo'"
```

### @analyst - Coleta com Interação
```bash
*browser run "Logar no portal do cliente, navegar até Relatórios, exportar último relatório em PDF"
*browser run "No LinkedIn, buscar por 'gerente de projetos' e extrair nomes das 10 primeiras pessoas"
```

### @devops - Validação de Deploy
```bash
*browser run "Verificar se https://producao.com/health retorna status 200"
*browser run "Acessar painel admin e verificar se serviços estão verde"
```

### @ux-design-expert - Análise de UI
```bash
*browser run "Capturar screenshot da página inicial em 3 tamanhos de tela diferentes"
*browser run "Verificar se todos os botões têm contraste acessível"
```

---

## Modos de Browser

| Modo | Comando | Uso |
|------|---------|-----|
| **chromium** (default) | `*browser open <url>` | Headless, rápido, isolado |
| **real** | `*browser --browser real` | Chrome real com seus logins |
| **remote** | `*browser --browser remote` | Cloud, stealth, anti-detecção |

---

## Execução Manual

Quando precisar executar diretamente (debugging, testes):

```bash
cd D:/workspace/.aios-tools/browser-use
source .venv/Scripts/activate
PYTHONIOENCODING=utf-8 browser-use <comando>
```

---

## Task AIOS

Documentação completa: `.aios-core/development/tasks/browser-automate.md`

---

## Troubleshooting

```bash
# Erro de encoding
PYTHONIOENCODING=utf-8 browser-use <comando>

# Verificar instalação
browser-use doctor

# Cache no C: (espaço insuficiente)
export UV_CACHE_DIR="D:/workspace/.aios-tools/uv-cache"
```

---

## Metadata

```yaml
created: 2026-02-20
location: D:/workspace/.aios-tools/browser-use/
task: .aios-core/development/tasks/browser-automate.md
command: *browser
```
