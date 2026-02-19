# AIOS Hub - Multi-Projeto Workspace

Este workspace é um **Hub AIOS** que orquestra múltiplos projetos isolados.

## Estrutura de Pastas

```
D:\workspace\                    ← WORKSPACE RAIZ (Hub)
├── .aios-core/                  ← Framework AIOS global
│   ├── data/                    ← Dados do framework
│   ├── scripts/                 ← Scripts do framework
│   └── development/             ← Agentes e tasks
├── projects/                    ← Projetos isolados
│   └── {nome-do-projeto}/       ← Cada projeto com seu .aios-core/
├── workflows/                   ← Workflows globais do Hub
├── squads/                      ← Squads globais do Hub
├── .aios/                       ← Status do Hub
│   └── project-status.yaml      ← Status consolidado
├── docs/                        ← Documentação
│   ├── prd/                     ← PRDs
│   ├── architecture/            ← Arquitetura
│   └── stories/                 ← Stories de desenvolvimento
└── .claude/                     ← Configuração do Claude Code
```

## Pastas

| Pasta | Propósito |
|-------|-----------|
| `projects/` | Projetos isolados com seus próprios `.aios-core/` |
| `workflows/` | Workflows globais que operam no nível do Hub |
| `squads/` | Squads globais para tarefas cross-domain |
| `.aios/` | Status consolidado do Hub |

## Comandos do AIOS Master

- `*list-projects` - Lista todos os projetos
- `*create-project {nome}` - Cria novo projeto
- `*switch-project {nome}` - Muda contexto para projeto
- `*sync` - Sincroniza estado dos projetos

## Referências

- PRD: `docs/prd/hub-multi-projeto.md`
- Arquitetura: `docs/architecture/hub-multi-projeto-architecture.md`
- Epic 1: `docs/stories/epics/epic-1-foundation-registry.md`

---

*AIOS Hub v1.0 - Criado em 2026-02-19*
