# PR Suggestions — aios-core

Sugestões de contribuições para o repositório oficial [SynkraAI/aios-core](https://github.com/SynkraAI/aios-core).

Este documento é vivo — revisado e atualizado conforme as sugestões evoluem.

---

## Status possíveis

| Status | Significado |
|--------|-------------|
| `draft` | Ideia mapeada, solução ainda não definida |
| `ready` | Solução definida, implementada localmente, pronta para submeter |
| `submitted` | PR aberto no repo oficial |
| `merged` | Aceito e mergeado |
| `rejected` | Rejeitado — motivo documentado no arquivo |
| `cancelled` | Descartado internamente antes de submeter |

---

## Abertos (open/)

| ID | Título | Status | Esforço | Impacto |
|----|--------|--------|---------|---------|
| [PR-001](open/PR-001-ready-for-qa-status.md) | Introduzir status `ReadyForQA` no SDC | `draft` | Médio | Alto |
| [PR-002](open/PR-002-lessons-activation-pipeline.md) | Integrar lessons.md na pipeline de ativação | `draft` | Pequeno | Médio |
| [PR-003](open/PR-003-full-delegation-protocol.md) | Protocolo completo de delegação (4 protocolos) | `ready` | Médio | Alto |
| [PR-004](open/PR-004-workflow-execution-reference.md) | Remover duplicação em workflow-execution.md | `ready` | Mínimo | Baixo |
| [PR-005](open/PR-005-sync-framework-devops-command.md) | Comando `*sync-framework` no @devops | `draft` | Pequeno | Médio |

---

## Submetidos (submitted/)

| PR | Título | Status | Issue |
|----|--------|--------|-------|
| [#542](submitted/PR-542-aios-master-delegation-enforcement.md) | fix(aios-master): delegation-first, remove No restrictions | `submitted` | #527 |
| [#543](submitted/PR-543-qa-gate-mandatory-status-update.md) | fix(qa-gate): mandatory story status update after gate verdict | `submitted` | — |

---

## Dependências entre PRs

```
PR-003 (4 protocolos)
  └── depende de: PR #542 (já submetido — minimal fix deve mergear primeiro)

PR-001 (ReadyForQA)
  └── independente, mas afeta: PR-003 (rejection script precisará citar ReadyForQA)

PR-004 (workflow-execution reference)
  └── independente
```

---

*Última atualização: 2026-03-02*
