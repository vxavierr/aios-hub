# Análise Minuciosa - Desktop D:\lenovo\Desktop

**Data:** 2026-02-20
**Analista:** Atlas (@analyst)
**Total analisado:** 68 itens (20 pastas + 48 arquivos)

---

## 🚨 ALERTAS DE SEGURANÇA

### ⚠️ CREDENCIAIS EXPLOSAS EM TEXTO PLANO

A pasta `Blocos de notas` contém **CREDENCIAIS SENSÍVEIS** em arquivos de texto:

| Arquivo | Conteúdo Perigoso |
|---------|-------------------|
| `ads_access.txt` | Token de acesso a Ads |
| `ads_token.txt` | Token de Ads |
| `APIs.txt` | Possíveis API keys |
| `OPENROUTER_API_KEY.txt` | API key do OpenRouter |
| `NOTIFY_TOKEN=...txt` | Token de notificação |
| `Senha root - VPS.txt` | Senha root de VPS |
| `login google uhuru.txt` | Credenciais Google |
| `login operand.txt` | Credenciais de login |
| `Supabase Mindo.txt` | Credenciais Supabase |
| `Mercado Pago Ligcargas.txt` | Credenciais Mercado Pago |
| `cadu-drive.json` | Possível credencial/service account |

**AÇÃO URGENTE:**
1. Mover para `D:\workspace\secrets\` (fora do Desktop)
2. Considerar usar gerenciador de senhas (1Password, Bitwarden)
3. Revogar/regenerar tokens se necessário

---

## 1. PASTAS - ANÁLISE DETALHADA

### 1.1 PROJETOS PRINCIPAIS (Manter e Organizar)

| Pasta | O que é | Tamanho Est. | Status | Ação |
|-------|---------|--------------|--------|------|
| `Agentes/` | Coleção de agentes IA, clones (Flávio Augusto, Thay Dantas), MCPs, RAG | ~2 GB | **ATIVO** | Mover para `workspace/projects/agentes-ia/` |
| `Mindo/` | App principal Mindo (React + Supabase + Backend Python) | ~500 MB | **ATIVO** | Mover para `workspace/projects/mindo/` |
| `Mindorchids/` | Versão mais completa do Mindo com AIOS, tests, CI/CD | ~1 GB | **PRINCIPAL** | Mover para `workspace/projects/mindorchids/` |
| `mindo-app/` | Outra versão do Mindo com mobile, Stripe, n8n | ~800 MB | **ATIVO** | Verificar duplicação com Mindorchids |
| `mindo-landinpage/` | Landing page Mindo com Stripe, n8n, Supabase | ~300 MB | **ATIVO** | Mover para `workspace/projects/mindo-landing/` |
| `Mindo-Gemini/` | Versão minimal do Mindo | ~50 MB | **DUPLICADO?** | Consolidar ou deletar |
| `Canvas Infinito/` | App React/Vite com Logseq para canvas infinito | ~200 MB | **ATIVO** | Mover para `workspace/projects/canvas-infinito/` |
| `AgêncIA/` | Sistema RAG + ingestão de conteúdo para agência | ~100 MB | **ATIVO** | Mover para `workspace/projects/agencia-rag/` |
| `uhuru/` | Projeto de análise de dados com Python (campanhas, performance) | ~50 MB | **ATIVO** | Mover para `workspace/projects/uhuru/` |
| `T/` | Projeto Python com AIOS (provavelmente teste) | ~30 MB | **TESTE** | Mover para `workspace/projects/t-project/` |
| `n8n/` | Workflows n8n (JSON exports) | ~10 KB | **CONFIG** | Mover para `workspace/configs/n8n-workflows/` |
| `HTMLS/` | Templates HTML do Mindo (waitlist, email, etc) | ~50 KB | **ASSETS** | Mover para `workspace/projects/mindo/assets/templates/` |

### 1.2 DUPLICADOS/VERSÕES (Avaliar)

| Pasta | O que é | Duplicado de | Ação |
|-------|---------|--------------|------|
| `aios-core-main/` | Clone do GitHub do AIOS | `D:\workspace\.aios-core\` | ❌ **DELETAR** - duplicado do workspace |
| `AIOS TESTE/` | Teste do AIOS com serviços | - | Avaliar se ainda necessário |
| `Moltbot/` | Apenas 1 Dockerfile | - | ❌ **DELETAR** - resto já foi movido |

### 1.3 LIXO (Deletar)

| Pasta | Motivo |
|-------|--------|
| `venv/` | Virtualenv Python solto - recriável |
| `browser-use-env/` | Virtualenv Python solto - recriável |
| `Nova pasta/` | Nome genérico, vazia |
| `Moltbot/` | Apenas 1 Dockerfile órfão |

---

## 2. ARQUIVOS - ANÁLISE DETALHADA

### 2.1 IMAGENS

| Arquivo | O que é | Ação |
|---------|---------|------|
| `FireShot Capture 012...png` | Screenshot de artigo (Justin Sung - NotebookLM) | Mover para `Arquivos/screenshots/` |
| `LIVRARIA.png` | Foto/render de livraria/café aconchegante | Mover para `Arquivos/imagens/inspiration/` |
| `Uhuru.png` | Foto do escritório Uhuru com logo na parede | Mover para `workspace/projects/uhuru/assets/` |
| `foto joão.jpg` | Foto pessoal do João ao ar livre | Mover para `Arquivos/pessoal/` |

### 2.2 INSTALADORES

| Arquivo | O que é | Tamanho | Ação |
|---------|---------|---------|------|
| `android-studio-2025.1.4.8-windows.exe` | Android Studio | ~1 GB | Mover para `D:\Instaladores/` |
| `DockerDesktopInstaller.exe` | Docker Desktop | ~500 MB | Mover para `D:\Instaladores/` |
| `jdk-25_windows-x64_bin.exe` | Java JDK 25 | ~200 MB | Mover para `D:\Instaladores/` |
| `logioptionsplus_installer.exe` | Logitech Options+ | ~100 MB | Mover para `D:\Instaladores/` |
| `Notion Setup 4.21.1.exe` | Notion Desktop | ~100 MB | Mover para `D:\Instaladores/` |

### 2.3 ATALHOS (Manter no Desktop)

| Arquivo | O que é | Ação |
|---------|---------|------|
| `CapCut.lnk` | Atalho CapCut | ✅ Manter |
| `Claude.lnk` | Atalho Claude Desktop | ✅ Manter |
| `Docker Desktop.lnk` | Atalho Docker | ✅ Manter |
| `Notion.lnk` | Atalho Notion | ✅ Manter |
| `Notion Calendar.lnk` | Atalho Notion Calendar | ✅ Manter |
| `ShareX.lnk` | Atalho ShareX | ✅ Manter |
| `Telegram.lnk` | Atalho Telegram | ✅ Manter |
| `Termius.lnk` | Atalho Termius | ✅ Manter |
| `Zoom Workplace.lnk` | Atalho Zoom | ✅ Manter |

### 2.4 URLs (Atalhos Web)

| Arquivo | Destino | Ação |
|---------|---------|------|
| `DSX.url` | Link para DSX | Avaliar necessidade |
| `Marvel's Spider-Man Remastered.url` | Link jogo Steam | Mover para `Arquivos/games/` |
| `Unravel Two.url` | Link jogo Steam | Mover para `Arquivos/games/` |

### 2.5 ZIPS/ARQUIVOS COMPACTADOS

| Arquivo | Conteúdo Provável | Ação |
|---------|-------------------|------|
| `01 - Foco-20251029...zip` (x2) | Arquivos de foco/produtividade | Descompactar e organizar ou deletar |
| `02 - Produtividade...zip` | Arquivos de produtividade | Descompactar e organizar ou deletar |
| `3 - Resumidor de Podcast.zip` | Projeto/curso | Descompactar em `projects/` |
| `3.Protoclo de Combate ao Medo...zip` | Material de estudo | Descompactar em `Arquivos/cursos/` |
| `aios-core-main.zip` | AIOS baixado do GitHub | ❌ DELETAR - já extraído |
| `Guia para usar o Claude 4.5...zip` | Guia/curso | Descompactar em `Arquivos/cursos/` |
| `mindo (1).zip` | Código do Mindo | Verificar se já extraído |
| `Mindorchids.zip` | Código do Mindorchids | ❌ DELETAR - já extraído |
| `Oraculo RAG.zip` | Projeto RAG | Descompactar em `projects/` |

### 2.6 DOCUMENTOS

| Arquivo | O que é | Ação |
|---------|---------|------|
| `# ??? Framework APEX - Agent Prompt.md` | Prompt de agente | Mover para `workspace/projects/agentes-ia/prompts/` |
| `Roteiros validados.md` | Roteiros para vídeos | Mover para `Arquivos/conteudo/` |
| `Roteiros validados.txt` | Cópia dos roteiros | ❌ DELETAR - duplicado |
| `?? IDEIAS DE CONTEÚDOS VIRAIS Técni.md` | Ideias de conteúdo | Mover para `Arquivos/conteudo/` |
| `Ideia de hook.txt` | Ideias de hooks para vídeos | Mover para `Arquivos/conteudo/` |
| `João Victor Xavier - atividade...` | Atividade escolar de cifragem | Mover para `Arquivos/pessoal/escola/` |

### 2.7 CÓDIGO/SCRIPTS

| Arquivo | O que é | Ação |
|---------|---------|------|
| `timerapp.py` | App Zenith Timer (Python + CTk) | Projeto útil! Mover para `workspace/projects/zenith-timer/` |
| `timerapp.pyw` | Mesmo app (versão silenciosa) | Junto com o acima |
| `canvas.html` | Canvas do Mindo (protótipo) | Mover para `workspace/projects/mindo/prototypes/` |
| `paywallmodal.html` | Modal de paywall Mindo | Mover para `workspace/projects/mindo/` |
| `paywallscreen.html` | Tela de paywall Mindo | Mover para `workspace/projects/mindo/` |
| `página.html` | Página genérica | Avaliar ou deletar |

### 2.8 DADOS/CONFIG

| Arquivo | O que é | Ação |
|---------|---------|------|
| `zenith_history.csv` | Histórico do timer Zenith | Mover com timerapp.py |
| `zenith.pid` | PID file do Zenith | ❌ DELETAR - temporário |
| `complete-analysis.json` | Análise (desconhecido) | Avaliar origem |
| `jason.json` | JSON genérico | Avaliar ou deletar |
| `Fluxo criação de conteúdo.excalidraw` | Diagrama Excalidraw | Mover para `Arquivos/diagrams/` |
| `desktop.ini` | Config do Windows | ✅ Manter (sistema) |

---

## 3. PROPOSTA DE NOMECLATURA PADRONIZADA

### Projetos
```
D:\workspace\projects\
├── agentes-ia/           # De "Agentes"
├── agencia-rag/          # De "AgêncIA"
├── canvas-infinito/      # Já bom
├── mindo/                # Principal
├── mindorchids/          # Versão completa
├── mindo-landing/        # Landing page
├── uhuru/                # Análises
├── zenith-timer/         # Timer app
└── clone-ai/             # Já existe
```

### Arquivos Pessoais
```
D:\Arquivos\
├── conteudo/             # Roteiros, ideias
├── cursos/               # Materiais de estudo
├── diagrams/             # Excalidraw, etc
├── games/                # Atalhos de jogos
├── imagens/              # Fotos, screenshots
│   ├── inspiration/
│   └── screenshots/
├── pessoal/              # Fotos pessoais, docs
├── screens/              # Screenshots
└── videos/               # Vídeos do WhatsApp
```

### Credenciais
```
D:\workspace\secrets\
├── api-keys/
├── tokens/
├── logins/
└── supabase/
```

---

## 4. PLANO DE EXECUÇÃO

### FASE 1: Segurança (URGENTE)
```powershell
# Criar pasta de secrets
New-Item -ItemType Directory -Path "D:\workspace\secrets" -Force
New-Item -ItemType Directory -Path "D:\workspace\secrets\api-keys" -Force
New-Item -ItemType Directory -Path "D:\workspace\secrets\tokens" -Force
New-Item -ItemType Directory -Path "D:\workspace\secrets\logins" -Force

# Mover credenciais (CUIDADO!)
Move-Item "D:\lenovo\Desktop\Blocos de notas\*.txt" -Destination "D:\workspace\secrets\" -Force
Move-Item "D:\lenovo\Desktop\Blocos de notas\*.json" -Destination "D:\workspace\secrets\api-keys\" -Force
```

### FASE 2: Limpeza de Lixo
```powershell
# Deletar venvs soltos
Remove-Item "D:\lenovo\Desktop\venv" -Recurse -Force
Remove-Item "D:\lenovo\Desktop\browser-use-env" -Recurse -Force
Remove-Item "D:\lenovo\Desktop\Nova pasta" -Recurse -Force
Remove-Item "D:\lenovo\Desktop\Moltbot" -Recurse -Force

# Deletar duplicados
Remove-Item "D:\lenovo\Desktop\aios-core-main" -Recurse -Force
Remove-Item "D:\lenovo\Desktop\aios-core-main.zip" -Force
Remove-Item "D:\lenovo\Desktop\Mindorchids.zip" -Force
Remove-Item "D:\lenovo\Desktop\Roteiros validados.txt" -Force
Remove-Item "D:\lenovo\Desktop\zenith.pid" -Force
```

### FASE 3: Criar Estrutura
```powershell
# Criar pastas de destino
New-Item -ItemType Directory -Path "D:\Arquivos\conteudo" -Force
New-Item -ItemType Directory -Path "D:\Arquivos\cursos" -Force
New-Item -ItemType Directory -Path "D:\Arquivos\diagrams" -Force
New-Item -ItemType Directory -Path "D:\Arquivos\games" -Force
New-Item -ItemType Directory -Path "D:\Arquivos\imagens\screenshots" -Force
New-Item -ItemType Directory -Path "D:\Arquivos\imagens\inspiration" -Force
New-Item -ItemType Directory -Path "D:\Arquivos\pessoal\escola" -Force
New-Item -ItemType Directory -Path "D:\Arquivos\videos" -Force
New-Item -ItemType Directory -Path "D:\Instaladores" -Force
```

### FASE 4: Mover Projetos
```powershell
# Mover projetos para workspace
Move-Item "D:\lenovo\Desktop\Agentes" -Destination "D:\workspace\projects\agentes-ia" -Force
Move-Item "D:\lenovo\Desktop\Mindo" -Destination "D:\workspace\projects\mindo" -Force
Move-Item "D:\lenovo\Desktop\Mindorchids" -Destination "D:\workspace\projects\mindorchids" -Force
Move-Item "D:\lenovo\Desktop\mindo-app" -Destination "D:\workspace\projects\mindo-app" -Force
Move-Item "D:\lenovo\Desktop\mindo-landinpage" -Destination "D:\workspace\projects\mindo-landing" -Force
Move-Item "D:\lenovo\Desktop\Mindo-Gemini" -Destination "D:\workspace\projects\mindo-gemini" -Force
Move-Item "D:\lenovo\Desktop\Canvas Infinito" -Destination "D:\workspace\projects\canvas-infinito" -Force
Move-Item "D:\lenovo\Desktop\AgêncIA" -Destination "D:\workspace\projects\agencia-rag" -Force
Move-Item "D:\lenovo\Desktop\uhuru" -Destination "D:\workspace\projects\uhuru" -Force
Move-Item "D:\lenovo\Desktop\T" -Destination "D:\workspace\projects\t-project" -Force

# Criar projeto Zenith Timer
New-Item -ItemType Directory -Path "D:\workspace\projects\zenith-timer" -Force
Move-Item "D:\lenovo\Desktop\timerapp.py" -Destination "D:\workspace\projects\zenith-timer\" -Force
Move-Item "D:\lenovo\Desktop\timerapp.pyw" -Destination "D:\workspace\projects\zenith-timer\" -Force
Move-Item "D:\lenovo\Desktop\zenith_history.csv" -Destination "D:\workspace\projects\zenith-timer\" -Force

# Mover HTMLS
Move-Item "D:\lenovo\Desktop\HTMLS" -Destination "D:\workspace\projects\mindo\assets\templates" -Force

# Mover n8n workflows
New-Item -ItemType Directory -Path "D:\workspace\configs\n8n-workflows" -Force
Move-Item "D:\lenovo\Desktop\n8n\*.json" -Destination "D:\workspace\configs\n8n-workflows\" -Force
```

### FASE 5: Mover Arquivos Diversos
```powershell
# Instaladores
Move-Item "D:\lenovo\Desktop\*.exe" -Destination "D:\Instaladores\" -Force

# Imagens
Move-Item "D:\lenovo\Desktop\*Screenshot*.png" -Destination "D:\Arquivos\imagens\screenshots\" -Force
Move-Item "D:\lenovo\Desktop\LIVRARIA.png" -Destination "D:\Arquivos\imagens\inspiration\" -Force
Move-Item "D:\lenovo\Desktop\foto joão.jpg" -Destination "D:\Arquivos\pessoal\" -Force
Move-Item "D:\lenovo\Desktop\Uhuru.png" -Destination "D:\workspace\projects\uhuru\assets\" -Force

# Zips
Move-Item "D:\lenovo\Desktop\*.zip" -Destination "D:\Arquivos\zips\" -Force

# Documentos
Move-Item "D:\lenovo\Desktop\*.md" -Destination "D:\Arquivos\conteudo\" -Force
Move-Item "D:\lenovo\Desktop\Ideia de hook.txt" -Destination "D:\Arquivos\conteudo\" -Force

# Diagramas
Move-Item "D:\lenovo\Desktop\*.excalidraw" -Destination "D:\Arquivos\diagrams\" -Force

# Games URLs
Move-Item "D:\lenovo\Desktop\*.url" -Destination "D:\Arquivos\games\" -Force

# HTMLs
Move-Item "D:\lenovo\Desktop\*.html" -Destination "D:\workspace\projects\mindo\prototypes\" -Force

# Vídeos
Move-Item "D:\lenovo\Desktop\vídeos" -Destination "D:\Arquivos\videos\whatsapp\" -Force

# Pessoal
Move-Item "D:\lenovo\Desktop\João Victor Xavier*" -Destination "D:\Arquivos\pessoal\escola\" -Force
```

### FASE 6: Avaliar AIOS TESTE e mindo-app
```powershell
# Verificar se AIOS TESTE ainda é necessário
# Se não, deletar:
# Remove-Item "D:\lenovo\Desktop\AIOS TESTE" -Recurse -Force

# Verificar se mindo-app é duplicado de mindorchids
# Se sim, consolidar ou deletar
```

---

## 5. RESULTADO ESPERADO

### Antes
```
D:\lenovo\Desktop\
├── 68 itens (20 pastas + 48 arquivos)
├── Projetos misturados
├── Credenciais expostas
├── Venvs soltos
├── Duplicados
└── Lixo acumulado
```

### Depois
```
D:\lenovo\Desktop\
├── CapCut.lnk
├── Claude.lnk
├── Docker Desktop.lnk
├── Notion.lnk
├── Notion Calendar.lnk
├── ShareX.lnk
├── Telegram.lnk
├── Termius.lnk
├── Zoom Workplace.lnk
└── desktop.ini

D:\workspace\projects\
├── agentes-ia/
├── agencia-rag/
├── canvas-infinito/
├── mindo/
├── mindorchids/
├── mindo-app/
├── mindo-landing/
├── mindo-gemini/
├── uhuru/
├── zenith-timer/
└── clone-ai/

D:\workspace\secrets\
├── api-keys/
├── tokens/
└── logins/

D:\Arquivos\
├── conteudo/
├── cursos/
├── diagrams/
├── games/
├── imagens/
├── pessoal/
├── videos/
└── zips/

D:\Instaladores\
├── android-studio-2025.1.4.8-windows.exe
├── DockerDesktopInstaller.exe
├── jdk-25_windows-x64_bin.exe
├── logioptionsplus_installer.exe
└── Notion Setup 4.21.1.exe
```

---

## 6. CHECKLIST DE EXECUÇÃO

### Antes de começar:
- [ ] Backup dos projetos importantes
- [ ] Fechar todos os programas
- [ ] Verificar espaço em disco

### Execução:
- [ ] FASE 1: Segurança (credenciais)
- [ ] FASE 2: Limpeza de lixo
- [ ] FASE 3: Criar estrutura
- [ ] FASE 4: Mover projetos
- [ ] FASE 5: Mover arquivos
- [ ] FASE 6: Avaliar duplicados

### Pós-execução:
- [ ] Testar atalhos do Desktop
- [ ] Verificar se projetos abrem
- [ ] Atualizar paths no VS Code/Cursor
- [ ] Deletar pasta `Blocos de notas` após mover credenciais

---

## 7. NOTAS ADICIONAIS

### Sobre o Zenith Timer
O `timerapp.py` é um **app de produtividade muito bem feito**:
- Timer estilo Raycast/Alfred
- System tray integration
- Notificações Windows
- Histórico em CSV
- Pausar/retomar
- **VALE A PENA MANTER E USAR!**

### Sobre Projetos Mindo
Existem **4 versões diferentes** do Mindo:
1. `Mindo/` - Versão base
2. `Mindorchids/` - Versão completa com AIOS
3. `mindo-app/` - Versão com mobile/Stripe
4. `mindo-landinpage/` - Landing page

**Recomendação:** Consolidar em um monorepo ou avaliar qual é a versão "verdadeira".

### Sobre Credenciais
A pasta `Blocos de notas` é um **risco de segurança crítico**. Além de mover, considere:
1. Usar variáveis de ambiente (.env)
2. Usar cofre de senhas
3. Revogar tokens antigos
4. Nunca commitar esses arquivos

---

*Análise minuciosa gerada por Atlas (@analyst) - 2026-02-20*
