# Secrets Management - Synkra AIOS

> **Document Type:** Security Documentation
> **Created:** 2026-02-20
> **Story:** TD-002
> **Last Updated:** 2026-02-20

---

## Overview

Este documento cataloga os arquivos sensíveis armazenados em `secrets/` e fornece recomendações de gerenciamento seguro.

## Status de Protecao

| Verificacao | Status |
|-------------|--------|
| Diretorio no .gitignore | OK (adicionado 2026-02-20) |
| Arquivos trackeados no git | Nenhum |
| Historico de commits | Limpo (nunca commitado) |

---

## Inventario de Arquivos

### CRITICAL - Rotacao Imediata Recomendada

| Arquivo | Tipo | Servico | Acao |
|---------|------|---------|------|
| `Senha root - VPS.txt` | Senha | VPS/Infra | Rotacionar senha root |
| `OPENROUTER_API_KEY.txt` | API Key | OpenRouter | Rotacionar chave |
| `ads_token.txt` | Token | Ads (Meta/Google) | Rotacionar token |
| `ads_access.txt` | Credencial | Ads (Meta/Google) | Rotacionar credencial |
| `NOTIFY_TOKEN=5d3e0d26255b4ff634d321.txt` | Token | Servico de notificacao | Rotacionar token |
| `api-keys/cadu-drive.json` | JSON Key | Google Drive API | Rotacionar service account |
| `httpsligcargas.com.brwp-admin.txt` | Credencial | WordPress Admin | Rotacionar senha |
| `Mercado Pago Ligcargas.txt` | Credencial | Mercado Pago | Rotacionar credenciais |
| `n8n-mcp.txt` | Credencial | n8n/MCP | Rotacionar |

### HIGH - Avaliar Rotacao

| Arquivo | Tipo | Servico | Acao |
|---------|------|---------|------|
| `login operand.txt` | Login | Operand | Avaliar rotacao |
| `login google uhuru.txt` | Login | Google | Avaliar rotacao |
| `Supabase Mindo.txt` | Credencial | Supabase | Avaliar rotacao |

### MEDIUM - Mover para docs/ (Nao sao secrets)

| Arquivo | Tipo | Conteudo | Acao |
|---------|------|----------|------|
| `cursor_melhor_forma_de_usar_a_api_do_ge.md` | Doc | Tutorial/Guia | Mover para docs/guides/ |
| `Deepseek.md` | Doc | Documentacao | Mover para docs/guides/ |
| `RÉGUA COMPLETA REFINADA - MINDO.md` | Doc | Regras de negocio | Mover para docs/business/ |

### LOW - Avaliar Necessidade

| Arquivo | Tipo | Conteudo | Acao |
|---------|------|----------|------|
| `Chats claude.txt` | Notas | Historico de chats | Arquivar ou deletar |
| `Chats GPT.txt` | Notas | Historico de chats | Arquivar ou deletar |
| `Chats perplexity - app de revisao.txt` | Notas | Historico de chats | Arquivar ou deletar |
| `GPTs.txt` | Notas | Referencia de GPTs | Arquivar ou deletar |
| `APIs.txt` | Notas | Lista de APIs | Avaliar sensibilidade |

---

## Estrutura de Diretorios

```
secrets/
├── api-keys/           # Chaves de API (JSON)
│   └── cadu-drive.json
├── logins/             # Logins de servicos (vazio)
├── tokens/             # Tokens de acesso (vazio)
└── *.txt/*.md          # Arquivos na raiz
```

---

## Recomendacoes

### 1. Rotacao de Credenciais (Prioridade P0)

As seguintes credenciais devem ser rotacionadas imediatamente:
- Senha root VPS
- OpenRouter API Key
- Tokens de Ads
- Mercado Pago credenciais

### 2. Migracao para Variaveis de Ambiente

Recomenda-se mover credenciais ativas para variaveis de ambiente:
- Usar `.env` para desenvolvimento local
- Usar secret manager (Vault, AWS Secrets Manager) para producao

### 3. Limpeza de Arquivos Nao-Secrets

Os arquivos marcados como MEDIUM/LOW devem ser:
- Movidos para `docs/` se forem documentacao util
- Deletados se forem apenas notas temporarias

### 4. Organizacao Futura

Criar estrutura organizada:
```
secrets/
├── api-keys/       # Apenas chaves de API
├── tokens/         # Apenas tokens OAuth/Bearer
├── logins/         # Apenas credenciais de login
└── certs/          # Certificados e chaves
```

---

## Checklist de Seguranca

- [x] `secrets/` adicionado ao .gitignore
- [ ] Credenciais CRITICAL rotacionadas
- [ ] Arquivos nao-secrets movidos para docs/
- [ ] Historico de commits verificado
- [ ] Backup seguro criado antes de rotacao

---

## Referencias

- Story: `docs/stories/TD-002.story.md`
- Epic: `docs/stories/epics/epic-technical-debt.md`
- Assessment: `docs/prd/technical-debt-assessment.md`

---

*Gerado por @dev | Story TD-002*
*Synkra AIOS v4.2.13*
