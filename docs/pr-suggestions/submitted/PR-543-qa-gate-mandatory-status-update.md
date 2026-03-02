# PR-543 — fix(qa-gate): mandatory story status update after gate verdict

**Status:** `submitted`
**PR oficial:** https://github.com/SynkraAI/aios-core/pull/543
**Issue relacionada:** —
**Submetido em:** 2026-03-02
**Reviewers solicitados:** Pedrovaleriolopez, oalanicolas

---

## O que resolve

`@qa` criava o gate file mas deixava o campo `Status` da story em `InReview` — dado stale que qualquer agente consultando a story leria como estado incorreto.

Raiz dupla:
1. `qa-gate.md` não tinha instrução para atualizar o Status após o veredicto
2. `story-lifecycle.md` atribuía a transição para `Done` ao `@devops` (incorreto — @devops só faz push)

## Mudanças

- `qa-gate.md`: seção `MANDATORY FINAL STEP` com tabela verdict → Status e formato de Change Log
- `story-lifecycle.md`: tabela de status com @qa explícito nas transições InReview → Done e InReview → InProgress + bloco CRITICAL

## Histórico

- Problema identificado durante análise do sistema
- Implementado localmente no HUB e Mindo antes de submeter
- PR fechado e reaberto para ajuste de texto (tradução para português)
