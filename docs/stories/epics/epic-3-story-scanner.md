# Epic 3: Story Scanner

**Epic ID:** HUB-EPIC-3
**Status:** Draft
**Created:** 2026-02-20
**Owner:** João

---

## Goal

Implementar um scanner que vasculha as stories de todos os projetos e consolida no Hub, permitindo visibilidade completa do progresso de desenvolvimento cross-project.

---

## Description

O sync-projects.js atual só traz metadados básicos (`activeStory: "1.2"`), mas não o conteúdo das stories. Este epic cria um scanner que:

1. Lê `docs/stories/*.md` de cada projeto
2. Extrai títulos, status, progresso (checkboxes)
3. Consolida num arquivo `.aios/hub-stories.json`
4. Disponibiliza via comando `*list-stories` e no greeting

**Existing System Context:**
- sync-projects.js já detecta projetos
- entity-registry.yaml já tem schema de projects
- hub-context.json serve como cache rápido

**Enhancement Details:**
- Novo script `scan-stories.js` para extração de stories
- Novo arquivo `.aios/hub-stories.json` para cache
- Novo comando `*list-stories` no AIOS Master
- Integração opcional no greeting

---

## Stories

| Story ID | Title | Status | Executor |
|----------|-------|--------|----------|
| 3.1 | Script de Scan de Stories | Done | @dev |
| 3.2 | Comando *list-stories | Draft | @dev |
| 3.3 | Integração no Greeting | Draft | @dev |

---

## Story Details

### Story 3.1: Script de Scan de Stories

**As a** AIOS Master,
**I want** um script que escaneie `docs/stories/` de cada projeto,
**So that** eu tenha visibilidade completa de todas as stories em andamento.

**Acceptance Criteria:**
1. Script `scan-stories.js` criado em `.aios-core/scripts/`
2. Script lê todos os arquivos `*.md` em `docs/stories/` de cada projeto
3. Script extrai: título, status, epic, progresso (checkboxes)
4. Script gera `.aios/hub-stories.json` consolidado
5. Script completa em < 10 segundos para 5 projetos com 20 stories cada
6. Unit tests para o script

**File:** `docs/stories/3.1.scan-stories-script.md`

---

### Story 3.2: Comando *list-stories

**As a** João (Hub Owner),
**I want** um comando que liste todas as stories de todos os projetos,
**So that** eu possa ver rapidamente o que está sendo desenvolvido.

**Acceptance Criteria:**
1. Comando `*list-stories` adicionado ao AIOS Master
2. Task handler criado em `.aios-core/development/tasks/list-stories.md`
3. Suporta filtros: `--project`, `--status`, `--epic`
4. Output formatado em tabela com: Projeto | Story | Status | Progresso
5. Performance: < 500ms para exibir 50 stories

**File:** `docs/stories/3.2.list-stories-command.md`

---

### Story 3.3: Integração no Greeting

**As a** AIOS Master,
**I want** que o greeting mostre um resumo das stories ativas,
**So that** eu tenha contexto imediato ao ativar o agente.

**Acceptance Criteria:**
1. Greeting mostra contador de stories ativas (InProgress)
2. Greeting mostra quantas stories estão em Review
3. Cache em `.aios/hub-stories.json` usado para performance
4. Atualização lazy (só re-scan se cache > 5 minutos)
5. Configurável via `core-config.yaml`

**File:** `docs/stories/3.3.greeting-integration.md`

---

## Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| Epic 1 (Foundation) | Epic | ✅ Complete |
| Epic 2 (Hub Commands) | Epic | ⏳ In Progress |
| sync-projects.js | Script | ✅ Exists |
| hub-context.json | Cache | ✅ Exists |

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Performance com muitas stories | Medium | Medium | Cache TTL, lazy loading |
| Parse errors em stories mal formatadas | Medium | Low | Graceful degradation, skip invalid |
| Stories muito grandes (arquivos) | Low | Low | Limite de tamanho, truncate |

---

## Definition of Done

- [ ] All 3 stories completed with acceptance criteria met
- [ ] scan-stories.js working and tested
- [ ] *list-stories command functional
- [ ] Greeting integration working
- [ ] No regression in existing functionality
- [ ] Documentation updated

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-20 | 1.0 | Epic created | Orion (@aios-master) |

---

*Part of Hub Multi-Projeto AIOS - PRD: docs/prd/hub-multi-projeto.md*
