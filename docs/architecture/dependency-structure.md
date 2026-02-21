# Dependency Structure - Synkra AIOS HUB

> **Document Type:** Architecture Documentation
> **Created:** 2026-02-20
> **Last Updated:** 2026-02-20
> **Story:** TD-010

---

## Overview

Este documento descreve a estrutura de dependências do Synkra AIOS HUB, incluindo Node.js e Python.

## Node.js Dependencies

### Estrutura

```
D:/workspace/
├── .aios-core/
│   └── package.json              # Framework AIOS (core)
├── .aios-tools/
│   └── browser-deps/
│       └── package.json          # Playwright + WS (browser automation)
├── projects/
│   ├── clone-ai/
│   │   ├── package.json          # Projeto clone-ai
│   │   └── packages/*/
│   │       └── package.json      # Monorepo packages
│   └── pipeline-clones/
│       └── package.json          # Projeto pipeline-clones
└── [ROOT: sem package.json]     # HUB raiz não tem deps próprias
```

### package.json por Localização

| Localização | Propósito | Deps Principais |
|-------------|----------|-----------------|
| `.aios-core/` | Framework AIOS | Node.js tooling |
| `.aios-tools/browser-deps/` | Browser automation | playwright, ws |
| `projects/clone-ai/` | Projeto clone-ai | React, TypeScript |
| `projects/pipeline-clones/` | Projeto pipeline | TBD |

### Scripts Padrão

Todo package.json do AIOS deve ter:

```json
{
  "scripts": {
    "lint": "eslint src",
    "test": "vitest run",
    "build": "vite build",
    "dev": "vite"
  }
}
```

## Python Dependencies

### Estrutura

```
D:/workspace/
├── .venv-browser/               # Browser automation (playwright python)
├── .aios-tools/
│   └── browser-use/
│       └── .venv/               # browser-use tool
└── [Sem .venv na raiz]          # HUB raiz não tem Python deps
```

### Ambientes Python

| Localização | Propósito | Ferramenta |
|-------------|----------|------------|
| `.venv-browser/` | Browser automation | Playwright Python |
| `.aios-tools/browser-use/.venv/` | Agentic browser | browser-use |

### Gerenciamento

- **Recomendado:** uv (gerenciador rápido)
- **Cache:** `.aios-tools/uv-cache/`
- **Requirements:** Um por ferramenta específica

## Dependency Rules

### Para o HUB (Raiz)

1. **NÃO** criar package.json na raiz
2. **NÃO** criar .venv na raiz
3. **NÃO** criar node_modules na raiz

### Para Ferramentas

1. Criar em `.aios-tools/<ferramenta>/`
2. Isolar dependências em seu próprio ambiente
3. Documentar no README da ferramenta

### Para Projetos

1. Criar em `projects/<nome-projeto>/`
2. Usar estrutura monorepo se necessário
3. Herdar AIOS via symlink ou cópia

## Limpeza Realizada (TD-010)

| Ação | Antes | Depois |
|------|-------|--------|
| package.json na raiz | ✅ Existia | ❌ Movido para .aios-tools/browser-deps/ |
| node_modules na raiz | ✅ Existia | ❌ Removido |
| .venv na raiz | ✅ Vazio | ❌ Removido |
| .gitignore | Parcial | ✅ Atualizado com patterns Python |

## Comandos Úteis

### Limpar Dependências

```bash
# Node.js
find . -name "node_modules" -type d -exec rm -rf {} +

# Python
find . -name ".venv" -type d -exec rm -rf {} +
find . -name "__pycache__" -type d -exec rm -rf {} +
```

### Verificar Dependências

```bash
# Listar package.json
find . -name "package.json" -not -path "*/node_modules/*" | head -20

# Listar .venv
find . -name ".venv*" -type d | head -10

# Verificar tamanho
du -sh node_modules .venv* 2>/dev/null
```

---

*Documentado por @dev | Story TD-010*
*Synkra AIOS v4.2.13*
