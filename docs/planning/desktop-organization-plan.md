# Análise Minuciosa - Drive D:\ (Arquivo por Arquivo)

**Data:** 2026-02-20
**Analista:** Atlas (@analyst)
**Total analisado:** 16 pastas, ~100+ arquivos

---

## SUMÁRIO EXECUTIVO

| Pasta | Tamanho | Categoria | Ação Recomendada |
|-------|---------|-----------|------------------|
| `CapCut/` | 19 GB | Aplicativo | Consolidar |
| `cursor/` | 763 MB | IDE/Dev | Manter ou mover para Apps/ |
| `workspace/` | ~500 MB | Projetos | ✅ Manter |
| `MapData/` | 209 KB | Dados/Mapa | Verificar se é do moltbot |
| `tmp/` | 40 KB | Temporário | ❌ DELETAR |
| `moltbot/` | 33 KB | Projeto | Mover para workspace/projects/ |
| `TempCapCut/` | 8 KB | Temporário | ❌ DELETAR |
| `npm-cache/` | ? | Cache | Limpar ou consolidar |
| `uv-cache/` | ? | Cache | Limpar ou consolidar |
| `npm-global/` | ? | Ferramentas | Manter ou consolidar |
| `.pnpm-store/` | ? | Cache | Manter se usa pnpm |
| `AI_Cache/` | 0 (vazio?) | Cache ML | Verificar conteúdo |
| `CapCutData/` | 0 (vazio?) | Dados | Verificar/consolidar |

---

## 1. ANÁLISE DETALHADA POR PASTA

### 1.1 `D:\AI_Cache\` - Cache de Machine Learning

| Arquivo/Pasta | Tipo | Ação |
|---------------|------|------|
| `huggingface/` | Cache de modelos HuggingFace | ⚠️ Manter - pode ter modelos baixados |
| `torch/` | Cache de modelos PyTorch | ⚠️ Manter - pode ter modelos baixados |

**Análise:** Cache de modelos de IA. Se estiver vazio (0 bytes), pode deletar. Se tiver modelos, pode ser grande (GBs).

**Recomendação:** Verificar tamanho real. Se > 1GB, considerar limpar modelos não utilizados.

---

### 1.2 `D:\MapData\` - Dados de Mapas (209 KB)

| Arquivo | Tamanho | Tipo | Ação |
|---------|---------|------|------|
| `events.log` | 34 KB | Log de eventos | ⚠️ Verificar se necessário |
| `mapscache/index.idx` | ? | Índice de cache | Manter se usa |
| `mapscache/region/0000001200000D50.dat` | ? | Dados de região | Manter se usa |
| `overrides.json` | 20 KB | Configurações | Manter se usa |

**Análise:** Parece ser dados de mapas para algum sistema. Possivelmente relacionado ao moltbot.

**Recomendação:** Verificar se é dependência do moltbot. Se sim, mover para `moltbot/data/`. Se não, avaliar se ainda é necessário.

---

### 1.3 `D:\moltbot\` - Projeto de Bot (33 KB)

#### `D:\moltbot\state\` - Estado do Bot

| Arquivo | Tamanho | Tipo | Ação |
|---------|---------|------|------|
| `clawdbot.json` | ~2 KB | **CONFIG PRINCIPAL** | ⚠️ IMPORTANTE - Manter |
| `clawdbot.json.bak` | ~2 KB | Backup 1 | Manter (backup recente) |
| `clawdbot.json.bak.1` | ~2 KB | Backup 2 | Pode deletar (antigo) |
| `clawdbot.json.bak.2` | ~1 KB | Backup 3 | Pode deletar (antigo) |
| `node.json` | 186 B | Config de nó | Manter |
| `update-check.json` | 49 B | Check de update | Manter |

#### `D:\moltbot\state\agents\main\agent\`

| Arquivo | Tipo | Ação |
|---------|------|------|
| `auth-profiles.json` | Perfil de autenticação | ⚠️ IMPORTANTE - Manter |

#### `D:\moltbot\state\cron\`

| Arquivo | Tipo | Ação |
|---------|------|------|
| `jobs.json` | Jobs agendados | Manter se usa |
| `jobs.json.bak` | Backup de jobs | Manter |

#### `D:\moltbot\state\identity\`

| Arquivo | Tipo | Ação |
|---------|------|------|
| `device-auth.json` | Autenticação de dispositivo | ⚠️ IMPORTANTE - Manter |

#### `D:\moltbot\workspace\`

| Arquivo | Tipo | Ação |
|---------|------|------|
| (vazio) | - | Pasta vazia - pode deletar |

**Análise:** Projeto de bot (ClawDBot) com configurações de Telegram, gateway, e autenticação. Contém tokens sensíveis!

**⚠️ SEGURANÇA:** Os arquivos `clawdbot.json` e `device-auth.json` contêm tokens e credenciais. Manter seguro.

**Recomendação:**
1. Mover projeto inteiro para `D:\workspace\projects\moltbot\`
2. Deletar backups antigos (.bak.1, .bak.2)
3. Considerar mover MapData/ junto se for dependência

---

### 1.4 `D:\tmp\` - Temporários (40 KB)

| Arquivo | Tamanho | Data | Ação |
|---------|---------|------|------|
| `clawdbot/clawdbot-2026-01-29.log` | ~19 KB | 29/01/2026 | ❌ DELETAR - Log antigo |
| `openclaw/openclaw-2026-02-06.log` | ~20 KB | 06/02/2026 | ❌ DELETAR - Log antigo |

**Análise:** Logs de projetos que não estão mais ativos nesta localização. Logs de janeiro e fevereiro.

**Recomendação:** ❌ **DELETAR TUDO** - Logs antigos sem utilidade.

```powershell
Remove-Item -Path "D:\tmp\*" -Recurse -Force
```

---

### 1.5 `D:\cursor\` - IDE Cursor (763 MB)

| Arquivo/Pasta | Tamanho | Tipo | Ação |
|---------------|---------|------|------|
| `Cursor.exe` | 201 MB | Executável principal | ⚠️ Manter |
| `dxcompiler.dll` | 25 MB | Compilador DirectX | Manter (dependência) |
| `ffmpeg.dll` | 3 MB | Codec de vídeo | Manter (dependência) |
| `resources.pak` | 6 MB | Recursos | Manter |
| `libGLESv2.dll` | 8 MB | Gráficos | Manter |
| `locales/*.pak` | ~5 MB | 50+ traduções | Pode limpar idiomas não usados |
| `resources/` | ? | Recursos do app | Manter |
| `unins000.exe` | 3.5 MB | Desinstalador | Manter |
| `LICENSES.chromium.html` | 15 MB | Licenças | Manter (legal) |
| Outros DLLs | ~500 MB | Dependências | Manter |

**Análise:** Instalação completa do editor Cursor (baseado em VS Code com AI). Instalação válida e em uso.

**Recomendação:**
1. **Manter na raiz** (é uma instalação válida)
2. OU mover para `D:\Apps\Cursor\` se quiser organizar
3. Opcional: Deletar `locales/` de idiomas não usados (economiza ~3MB)

---

### 1.6 `D:\CapCut\` - Editor de Vídeo (19 GB!) ⚠️

#### `D:\CapCut\Apps\7.3.0.2974\`

| Arquivo | Tipo | Ação |
|---------|------|------|
| `*.dll` (50+ DLLs) | Dependências do app | Manter |
| `avcodec-61.dll`, `avformat-61.dll`, etc | Codecs FFmpeg | Manter |
| `api-ms-win-*.dll` (30+ DLLs) | APIs Windows | Manter |

**Análise:** Instalação do CapCut Desktop v7.3.0.2974. Grande devido a DLLs de vídeo e efeitos.

#### `D:\CapCut\User Data\` e `D:\CapCut\Videos\`

| Pasta | Tipo | Ação |
|-------|------|------|
| `User Data/` | Configurações do usuário | Manter |
| `Videos/` | Assets/vídeos do app | Manter |

**Recomendação:** Consolidar com CapCutData/.

---

### 1.7 `D:\CapCutData\` - Dados do CapCut

| Pasta | Tipo | Ação |
|-------|------|------|
| `Cache/` | Cache de renderização | ⚠️ Pode limpar periodicamente |
| `Drafts/` | Projetos em rascunho | ⚠️ IMPORTANTE - Manter |
| `Presets/` | Presets salvos | Manter |
| `VideoRecord/` | Gravações | Manter se importantes |

**Análise:** Dados do usuário do CapCut separados da instalação. Contém projetos!

**⚠️ IMPORTANTE:** `Drafts/` pode ter projetos importantes. NÃO DELETAR sem verificar.

**Recomendação:** Consolidar com CapCut/ em estrutura unificada:
```
D:\Apps\CapCut\
├── App\          ← De D:\CapCut\Apps\
├── Data\         ← De D:\CapCutData\
└── Cache\        ← De D:\CapCutData\Cache\
```

---

### 1.8 `D:\TempCapCut\` - Temporários CapCut (8 KB)

| Arquivo | Tamanho | Tipo | Ação |
|---------|---------|------|------|
| `TreeSizeFree.png` | 2 KB | Screenshot | ❌ DELETAR - Lixo |
| `WinGet/` | 6 KB | Cache WinGet | ❌ DELETAR - Temporário |

**Análise:** Temporários e lixo do CapCut + screenshot aleatório.

**Recomendação:** ❌ **DELETAR PASTA INTEIRA**

```powershell
Remove-Item -Path "D:\TempCapCut" -Recurse -Force
```

---

### 1.9 `D:\npm-cache\` - Cache npm

| Arquivo/Pasta | Tipo | Ação |
|---------------|------|------|
| `_cacache/` | Cache principal (milhares de arquivos) | ⚠️ Limpar com `npm cache clean --force` |
| `_logs/` | Logs npm | Pode deletar |
| `_npx/` | Cache de comandos npx | Pode limpar |
| `.tmp/` | Temporários | Pode deletar |
| `*.npm` | Pacotes cacheados | Limpo com npm cache clean |

**Análise:** Cache do npm que pode crescer muito (GBs).

**Recomendação:**
```powershell
npm cache clean --force
```
Isso limpa o cache de forma segura. O npm recria o que precisar.

---

### 1.10 `D:\npm-global\` - Pacotes Globais npm

| Arquivo/Pasta | Tipo | Ação |
|---------------|------|------|
| `node_modules/@playwright/mcp/` | Playwright MCP | ⚠️ Manter - ferramenta ativa |
| `node_modules/playwright/` | Playwright | ⚠️ Manter - dependência do MCP |
| `npm`, `npx`, `playwright*` | Wrappers CLI | Manter |

**Análise:** Ferramentas globais instaladas. Playwright MCP está ativo.

**Recomendação:** Manter - é onde ficam ferramentas CLI globais do npm.

---

### 1.11 `D:\uv-cache\` - Cache Python/uv

| Pasta | Tipo | Ação |
|-------|------|------|
| `archive-v0/` | Pacotes Python baixados | ⚠️ Pode limpar |
| `builds-v0/` | Builds compilados | Pode limpar |
| `interpreter-v4/` | Interpreters Python | Manter ou limpar |
| `sdists-v9/` | Source distributions | Pode limpar |
| `simple-v16/` | Índice de pacotes | Pode limpar |
| `wheels-v5/` | Wheels compilados | Pode limpar |

**Análise:** Cache do gerenciador de pacotes Python `uv`. Contém pacotes PyPI.

**Recomendação:**
```powershell
uv cache clean
```
Limpa o cache de forma segura.

---

### 1.12 `D:\.pnpm-store\` - Store pnpm

| Arquivo | Tipo | Ação |
|---------|------|------|
| `v10/files/**/*` | Pacotes cacheados | Manter se usa pnpm |

**Análise:** Cache global do pnpm para monorepos. Necessário se usa pnpm.

**Recomendação:** Manter se usa pnpm. Se não, pode deletar.

---

### 1.13 `D:\Revo Uninstaller\` - Desinstalador (60 arquivos)

| Arquivo | Tipo | Ação |
|---------|------|------|
| `RevoUnin.exe` | Executável principal | Manter se usa |
| `RevoSrp.exe` | Componente | Manter |
| `RevoProcessDetector.sys` | Driver | Manter |
| `lang/*.ini` (50+ arquivos) | Traduções | Manter |
| `unins000.exe` | Desinstalador | Manter |
| `License.txt` | Licença | Manter |
| `Revo Uninstaller Help.pdf` | Documentação | Manter |

**Análise:** Instalação do Revo Uninstaller (desinstalador avançado).

**Recomendação:** Mover para `D:\Apps\RevoUninstaller\` ou para `Program Files\`.

---

### 1.14 `D:\Área de Trabalho\` - Desktop

| Arquivo | Tamanho | Tipo | Ação |
|---------|---------|------|------|
| `seguranca-clawdbot.md` | 6 KB | Documentação | ⚠️ IMPORTANTE - Manter |

**Análise:** Documento de análise de segurança do ClawDBot. Contém plano de implementação de segurança.

**Conteúdo importante:**
- Vulnerabilidades identificadas do bot
- Tokens expostos (🚨)
- Plano de implementação de segurança
- Checklist de implementação

**⚠️ SEGURANÇA:** Este documento contém informações sensíveis sobre vulnerabilidades.

**Recomendação:** Mover para `D:\workspace\docs\` ou `D:\moltbot\docs\` após reorganizar.

---

### 1.15 `D:\workspace\` - Hub de Desenvolvimento

| Pasta | Tipo | Ação |
|-------|------|------|
| `.aios-core/` | Framework AIOS | ✅ Manter |
| `.aios/` | Configurações do Hub | ✅ Manter |
| `.claude/` | Config Claude Code | ✅ Manter |
| `docs/` | Documentação | ✅ Manter |
| `projects/clone-ai/` | Projeto ativo | ✅ Manter |
| `squads/` | Templates | ✅ Manter |
| `workflows/` | Workflows | ✅ Manter |

**Análise:** Hub AIOS muito bem organizado. Modelo de referência.

**Recomendação:** ✅ Manter como está - é o padrão a seguir.

---

## 2. CATEGORIZAÇÃO FINAL

### 🔴 LIXO (Deletar Imediatamente)

| Pasta/Arquivo | Tamanho | Motivo |
|---------------|---------|--------|
| `D:\tmp\` | 40 KB | Logs antigos |
| `D:\TempCapCut\` | 8 KB | Temporários |
| `D:\moltbot\state\*.bak.1` | ~2 KB | Backup antigo |
| `D:\moltbot\state\*.bak.2` | ~1 KB | Backup antigo |
| `D:\moltbot\workspace\` | 0 | Pasta vazia |

**Total recuperável:** ~50 KB

### 🟡 CACHE (Limpar com Comandos)

| Pasta | Comando de Limpeza |
|-------|-------------------|
| `D:\npm-cache\` | `npm cache clean --force` |
| `D:\uv-cache\` | `uv cache clean` |

**Total recuperável:** Depende do uso (pode ser GBs)

### 🟠 CONSOLIDAR

| De | Para |
|----|----|
| `D:\CapCut\` + `D:\CapCutData\` | `D:\Apps\CapCut\` |
| `D:\moltbot\` | `D:\workspace\projects\moltbot\` |
| `D:\Revo Uninstaller\` | `D:\Apps\RevoUninstaller\` |
| `D:\cursor\` | `D:\Apps\Cursor\` (opcional) |

### ✅ MANTER

| Pasta | Motivo |
|-------|--------|
| `D:\workspace\` | Hub de desenvolvimento |
| `D:\npm-global\` | Ferramentas globais ativas |
| `D:\.pnpm-store\` | Cache pnpm (se usa) |
| `D:\AI_Cache\` | Cache ML (verificar conteúdo) |
| `D:\MapData\` | Dados de mapas (verificar dependência) |

---

## 3. PLANO DE AÇÃO DETALHADO

### FASE 1: Limpeza Imediata (5 minutos)

```powershell
# 1. Deletar temporários
Remove-Item -Path "D:\tmp\*" -Recurse -Force
Remove-Item -Path "D:\TempCapCut" -Recurse -Force

# 2. Deletar backups antigos do moltbot
Remove-Item -Path "D:\moltbot\state\clawdbot.json.bak.1" -Force
Remove-Item -Path "D:\moltbot\state\clawdbot.json.bak.2" -Force

# 3. Limpar caches
npm cache clean --force
uv cache clean
```

### FASE 2: Criar Estrutura (2 minutos)

```powershell
New-Item -ItemType Directory -Path "D:\Apps" -Force
```

### FASE 3: Mover Projetos (5 minutos)

```powershell
# Mover moltbot para workspace
Move-Item -Path "D:\moltbot" -Destination "D:\workspace\projects\moltbot" -Force

# Mover MapData junto se for dependência
Move-Item -Path "D:\MapData" -Destination "D:\workspace\projects\moltbot\data\MapData" -Force
```

### FASE 4: Consolidar Apps (10 minutos)

```powershell
# Consolidar CapCut
Move-Item -Path "D:\CapCut" -Destination "D:\Apps\CapCut" -Force
Move-Item -Path "D:\CapCutData\Cache" -Destination "D:\Apps\CapCut\Cache" -Force
Move-Item -Path "D:\CapCutData\Drafts" -Destination "D:\Apps\CapCut\Drafts" -Force
Move-Item -Path "D:\CapCutData\Presets" -Destination "D:\Apps\CapCut\Presets" -Force
Move-Item -Path "D:\CapCutData\VideoRecord" -Destination "D:\Apps\CapCut\VideoRecord" -Force
Remove-Item -Path "D:\CapCutData" -Force

# Mover Revo Uninstaller
Move-Item -Path "D:\Revo Uninstaller" -Destination "D:\Apps\RevoUninstaller" -Force

# Mover Cursor (opcional)
Move-Item -Path "D:\cursor" -Destination "D:\Apps\Cursor" -Force
```

### FASE 5: Mover Documentação (2 minutos)

```powershell
# Mover documento de segurança para workspace
Move-Item -Path "D:\Área de Trabalho\seguranca-clawdbot.md" -Destination "D:\workspace\docs\moltbot-security.md" -Force
```

---

## 4. RESULTADO FINAL ESPERADO

### Antes
```
D:\
├── 24 pastas (desorganizado)
├── Caches espalhados
├── Projetos isolados
└── Temporários acumulados
```

### Depois
```
D:\
├── workspace/              # Hub de desenvolvimento
│   ├── projects/
│   │   ├── clone-ai/
│   │   └── moltbot/       # ← Movido
│   └── docs/
│       └── moltbot-security.md  # ← Movido
│
├── Apps/                   # Aplicativos
│   ├── CapCut/            # ← Consolidado
│   ├── Cursor/            # ← Movido
│   └── RevoUninstaller/   # ← Movido
│
├── npm-global/             # Manter (ferramentas)
├── .pnpm-store/            # Manter (cache pnpm)
├── AI_Cache/               # Manter (cache ML)
│
├── [Sistema - não mexer]
│   ├── $RECYCLE.BIN/
│   ├── WindowsApps/
│   └── ...
│
└── Área de Trabalho/       # Desktop limpo
```

---

## 5. CHECKLIST DE EXECUÇÃO

### Antes de começar:
- [ ] Fazer backup de `D:\moltbot\state\`
- [ ] Fazer backup de `D:\CapCutData\Drafts\` (projetos!)
- [ ] Fechar todos os programas

### Execução:
- [ ] FASE 1: Limpeza de temporários
- [ ] FASE 2: Criar estrutura Apps/
- [ ] FASE 3: Mover moltbot
- [ ] FASE 4: Consolidar apps
- [ ] FASE 5: Mover documentação

### Pós-execução:
- [ ] Testar se Cursor abre
- [ ] Testar se CapCut abre
- [ ] Verificar projetos em Drafts
- [ ] Atualizar atalhos se necessário

---

*Análise minuciosa gerada por Atlas (@analyst) - 2026-02-20*
