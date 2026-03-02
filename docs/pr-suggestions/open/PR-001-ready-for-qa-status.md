# PR-001 — Introduzir status `ReadyForQA` no SDC

**Status:** `draft`
**Esforço:** Médio (1-2h)
**Impacto:** Alto
**Depende de:** —

---

## Problema

O status `InReview` é ambíguo: representa tanto "implementação concluída pelo @dev" quanto "@qa está revisando agora". Dois agentes distintos têm motivos legítimos para setar esse status, mas em momentos diferentes — criando uma janela onde o campo não reflete o estado real.

Situação atual:
```
InProgress → InReview → Done
             ↑           ↑
        quem seta?   @qa seta (fix #543)
        @dev ou @qa?
```

---

## Solução proposta

Introduzir `ReadyForQA` como status intermediário:

```
Draft → Ready → InProgress → ReadyForQA → InReview → Done
                              ↑             ↑
                         @dev seta      @qa seta ao
                         ao terminar    iniciar review
```

Cada agente atualiza exatamente o que sabe: `@dev` sabe que terminou, `@qa` sabe que começou. Sem sobreposição, sem ambiguidade.

---

## Arquivos afetados

| Arquivo | Mudança |
|---------|---------|
| `.claude/rules/story-lifecycle.md` | Adicionar `ReadyForQA` na tabela de status e progressão |
| `.claude/rules/workflow-execution.md` | Atualizar SDC Phase 3 e Phase 4 |
| `.aios-core/development/tasks/dev-develop-story.md` | Instrução explícita: ao terminar, setar `ReadyForQA` |
| `.aios-core/development/tasks/qa-gate.md` | Instrução explícita: ao iniciar review, setar `InReview` |
| Templates de story | Adicionar `ReadyForQA` como valor válido no campo Status |

---

## Contra-argumentos mapeados

- Adiciona complexidade ao fluxo (mais um status para rastrear)
- Stories existentes precisam ser avaliadas — nenhuma ficará em estado inválido, mas o novo status simplesmente não existirá nelas até a próxima transição

---

## Notas

Esse PR é pequeno em código mas requer coordenação com qualquer PR que cite o fluxo de status do SDC (incluindo PR-003).
