# PR-004 — Remover duplicação em workflow-execution.md

**Status:** `ready`
**Esforço:** Mínimo (5min)
**Impacto:** Baixo (consistência)
**Depende de:** —

---

## Problema

`workflow-execution.md` e `story-lifecycle.md` descrevem o mesmo fluxo de status do SDC. Após o fix do PR #543, os dois ficaram inconsistentes:

- `story-lifecycle.md`: @qa é dono de InReview → Done e InReview → InProgress ✓
- `workflow-execution.md` Phase 4: ainda tinha `Status: InProgress → InReview → Done` (sem atribuição de responsabilidade)

Dois documentos descrevendo a mesma coisa = drift garantido em qualquer mudança futura.

---

## Solução proposta

Substituir a linha de status da Phase 4 no `workflow-execution.md` por uma referência:

```markdown
#### Phase 4: QA Gate (@qa)
- **Task:** `qa-gate.md`
- **7 quality checks** (see `story-lifecycle.md`)
- **Decision:** PASS / CONCERNS / FAIL / WAIVED
- **Status:** ver `story-lifecycle.md` — @qa é dono de todas as transições nesta fase
```

`workflow-execution.md` mantém o papel de visão de fluxo. `story-lifecycle.md` é a especificação detalhada. Um aponta para o outro, sem duplicação.

---

## Arquivos afetados

| Arquivo | Mudança |
|---------|---------|
| `.claude/rules/workflow-execution.md` | Substituir linha de status da Phase 4 por referência |

---

## Notas

Já implementado localmente no HUB. PR trivial — uma linha substituída.
