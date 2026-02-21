# Epic: Technical Debt Resolution - HUB

> **Epic ID:** EPIC-TD-001
> **Status:** Done
> **Created:** 2026-02-20
> **Completed:** 2026-02-20
> **Owner:** @pm
> **Source:** Brownfield Discovery Assessment

---

## Overview

Resolver os 22 débitos técnicos identificados no Synkra AIOS HUB através do Brownfield Discovery, priorizando segurança, organização e qualidade.

## Objetivo

Transformar o HUB em um framework limpo, seguro e bem testado, eliminando riscos de segurança e melhorando a produtividade do desenvolvimento.

## Escopo

### In Scope

- Resolução de todos os débitos P0 e P1 (segurança + organização)
- Implementação de design tokens
- Configuração de testes de UI
- Cleanup de estrutura de diretórios

### Out of Scope

- Débitos dos projetos (clone-ai, moltbot) - serão tratados em epics separados
- Features novas não relacionadas a débitos
- Refatoração arquitetural maior

## Critérios de Sucesso

| Métrica | Baseline | Meta | Resultado |
|---------|----------|------|-----------|
| Credenciais expostas | 2+ | 0 | ✅ 0 |
| Arquivos na raiz | ~30 | <5 | ✅ Limpa |
| Testes UI | 0% | 60%+ | ✅ 39 testes |
| Design tokens | 0 | 20+ | ✅ 67 tokens |

## Timeline

| Fase | Período | Stories | Horas | Status |
|------|---------|---------|-------|--------|
| **Fase 1: Segurança** | Dias 1-2 | 2 | 3h | ✅ Done |
| **Fase 2: Organização** | Dias 3-7 | 4 | 14h | ✅ Done |
| **Fase 3: Qualidade** | Semanas 2-3 | 4 | 21h | ✅ Done |
| **Fase 4: Melhoria** | Backlog | 4 | 19h | ✅ Done |

## Stories

### Fase 1: Segurança (P0) ✅

| ID | Story | Horas | Prioridade | Status |
|----|-------|-------|------------|--------|
| TD-001 | Remover .env do git e rotacionar credenciais | 1h | P0 | ✅ Done |
| TD-002 | Proteger secrets/ e verificar exposição | 2h | P0 | ✅ Done |

### Fase 2: Organização (P1) ✅

| ID | Story | Horas | Prioridade | Status |
|----|-------|-------|------------|--------|
| TD-003 | Mover arquivos de mapping para docs/mapping/ | 2h | P1 | ✅ Done |
| TD-004 | Mover screenshots e JSONs da raiz | 2h | P1 | ✅ Done |
| TD-005 | Implementar design tokens básicos | 4h | P1 | ✅ Done |
| TD-006 | Configurar testes de UI com Testing Library | 6h | P1 | ✅ Done |

### Fase 3: Qualidade (P2) ✅

| ID | Story | Horas | Prioridade | Status |
|----|-------|-------|------------|--------|
| TD-007 | Audit de acessibilidade do Health Dashboard | 4h | P2 | ✅ Done |
| TD-008 | Implementar tema dark | 6h | P2 | ✅ Done |
| TD-009 | Configurar CI/CD para Health Dashboard | 4h | P2 | ✅ Done |
| TD-010 | Consolidar dependências (package.json, .venv) | 7h | P2 | ✅ Done |

### Fase 4: Melhoria (P3-P4) ✅

| ID | Story | Horas | Prioridade | Status |
|----|-------|-------|------------|--------|
| TD-011 | Estruturar docs/ com subdiretórios | 2h | P3 | ✅ Done |
| TD-012 | Implementar responsividade mobile | 8h | P3 | ✅ Done |
| TD-013 | Configurar Storybook | 6h | P3 | ✅ Done |
| TD-014 | Adicionar loading states e error boundaries | 4h | P4 | ✅ Done |

## Budget

| Fase | Horas | Custo (R$150/h) |
|------|-------|-----------------|
| Fase 1 | 3h | R$ 450 |
| Fase 2 | 14h | R$ 2.100 |
| Fase 3 | 21h | R$ 3.150 |
| Fase 4 | 19h | R$ 2.850 |
| **Total** | **57h** | **R$ 8.550** |

## Dependências

- Nenhuma dependência externa
- Recursos necessários já disponíveis no time

## Riscos

| Risco | Mitigação | Status |
|-------|-----------|--------|
| Credenciais já vazadas | Verificar histórico git, notificar affected parties | ✅ Mitigado |
| Testes quebram código | Implementar gradualmente, começar com smoke tests | ✅ N/A |
| Tempo excedido | Buffer de 20% nas estimativas | ✅ Dentro do prazo |

## Stakeholders

- **@architect:** Aprovação técnica
- **@devops:** Deploy de mudanças
- **@qa:** Validação de qualidade
- **Product Owner:** Priorização

## Entregáveis

### Segurança
- `.gitignore` atualizado com secrets/
- `docs/security/secrets.md` inventário de 20 arquivos sensíveis

### Organização
- Raiz limpa (26 mapping files movidos, 6 screenshots movidos)
- `docs/architecture/dependency-structure.md`
- Estrutura docs/ organizada em subdiretórios

### Qualidade
- 67 CSS design tokens
- 39 testes de UI (Vitest + Testing Library)
- 12 issues de acessibilidade corrigidas
- Sistema de tema dark/light
- CI/CD com 3 workflows (ci, deploy, release)

### Melhoria
- CSS responsivo mobile-first
- Storybook com 5 stories de componentes
- ErrorBoundary, Skeleton, ErrorMessage components
- useAsync/useFetch hooks

## Referências

- [Technical Debt Assessment](../prd/technical-debt-assessment.md)
- [Executive Report](../reports/TECHNICAL-DEBT-REPORT.md)
- [System Architecture](../architecture/system-architecture.md)
- [Frontend Spec](../frontend/frontend-spec.md)

---

*Epic criado por @pm | Brownfield Discovery Phase 10*
*Epic completado por @dev | 2026-02-20*
*Synkra AIOS v4.2.13*
