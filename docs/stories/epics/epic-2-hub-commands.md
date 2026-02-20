# Epic 2: Hub Commands

**Status:** In Progress
**PRD Reference:** docs/prd/hub-multi-projeto.md
**Architecture Reference:** docs/architecture/hub-multi-projeto-architecture.md

---

## Goal

Implementar comandos no AIOS Master para listar, criar, e trocar contexto entre projetos.

---

## Stories

| Story | Title | Status | Description |
|-------|-------|--------|-------------|
| 2.1 | *list-projects | Draft | Listar todos os projetos com seus status |
| 2.2 | *create-project | Draft | Criar novos projetos com AIOS isolado |
| 2.3 | *switch-project | Draft | Mudar contexto para um projeto específico |
| 2.4 | *project-status | Draft | Ver status detalhado de um projeto |

---

## Dependencies

- Epic 1 (Foundation & Registry) - **COMPLETE**
  - sync-projects.js disponível
  - entity-registry.yaml com schema de projects
  - hub-context.json como cache rápido

---

## Definition of Done

- [ ] Todos os 4 comandos implementados
- [ ] Comandos documentados no AIOS Master
- [ ] Tasks handlers criados em .aios-core/development/tasks/
- [ ] Testes manuais de cada comando
- [ ] QA review completo

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-19 | 1.0 | Epic created | River (@sm) |
