# Epic 1: Foundation & Registry

**Epic ID:** HUB-EPIC-1
**Status:** Done
**Created:** 2026-02-19
**Owner:** João

---

## Goal

Estabelecer a estrutura de pastas, o registry de projetos no entity-registry.yaml, e o script de sincronização que detecta e registra projetos automaticamente.

---

## Description

Este epic cria a fundação do Hub Multi-Projeto AIOS, permitindo que múltiplos projetos sejam detectados, registrados e sincronizados automaticamente.

**Existing System Context:**
- AIOS framework com entity-registry.yaml
- Sistema de project-status já funcional
- unified-activation-pipeline.js para ativação de agentes

**Enhancement Details:**
- Nova seção `projects` no entity-registry.yaml
- Script sync-projects.js para detecção automática
- Estrutura de pastas organizada

---

## Stories

| Story ID | Title | Status | Executor |
|----------|-------|--------|----------|
| 1.1 | Criar Estrutura de Pastas do Hub | Done | @dev |
| 1.2 | Script de Sincronização de Projetos | Done | @dev |
| 1.3 | Schema de Project no Entity Registry | Done | @architect |

---

## Story Details

### Story 1.1: Criar Estrutura de Pastas do Hub

**As a** João (Hub Owner),
**I want** uma estrutura de pastas organizada para o Hub,
**So that** eu tenha um local claro para projetos, workflows e recursos globais.

**Acceptance Criteria:**
1. Pasta `projects/` criada para projetos isolados
2. Pasta `workflows/` criada para workflows globais do Hub
3. Pasta `squads/` criada para squads globais
4. Arquivo `.aios/project-status.yaml` criado para status do Hub
5. Estrutura documentada no README do Hub

**File:** `docs/stories/1.1.hub-folder-structure.md`

---

### Story 1.2: Script de Sincronização de Projetos

**As a** AIOS Master,
**I want** um script que escaneie `projects/` e atualize o entity-registry,
**So that** eu tenha visibilidade atualizada de todos os projetos.

**Acceptance Criteria:**
1. Script `sync-projects.js` criado em `.aios-core/scripts/`
2. Script detecta pastas com `.aios-core/` como projetos válidos
3. Script adiciona/atualiza entidades tipo `project` no `entity-registry.yaml`
4. Script lê `project-status.yaml` de cada projeto e consolida no Hub
5. Script completa em < 5 segundos para 10 projetos
6. Unit tests para o script

**File:** `docs/stories/1.2.sync-projects-script.md`

---

### Story 1.3: Schema de Project no Entity Registry

**As a** AIOS Developer,
**I want** um schema definido para entidades tipo `project`,
**So that** o registry tenha estrutura consistente.

**Acceptance Criteria:**
1. Schema documentado para entidades `project` no entity-registry
2. Campos obrigatórios: `path`, `aiosCore`, `status`, `lastActivity`
3. Campos opcionais: `techStack`, `activeStory`, `activeEpic`, `description`
4. Script de validação para garantir conformidade

**File:** `docs/stories/1.3.project-schema-registry.md`

---

## Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| PRD | Document | ✅ Complete |
| Architecture | Document | ✅ Complete |
| Entity Registry | System | ✅ Exists |

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Performance issues with sync | Low | Medium | Async operations, caching |
| YAML corruption | Low | High | Atomic writes, backups |
| Path issues on Windows | Medium | Medium | Use path.join() always |

---

## Definition of Done

- [x] All 3 stories completed with acceptance criteria met
- [x] Hub folder structure functional
- [x] sync-projects.js working and tested
- [x] Schema documented and validated
- [x] No regression in existing functionality

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-19 | 1.0 | Epic created | River (@sm) |
| 2026-02-20 | 1.1 | Epic completed - all DoD items verified | Orion (@aios-master) |

---

*Part of Hub Multi-Projeto AIOS - PRD: docs/prd/hub-multi-projeto.md*
