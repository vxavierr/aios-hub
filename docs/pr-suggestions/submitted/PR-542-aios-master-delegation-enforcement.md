# PR-542 — fix(aios-master): delegation-first, remove "No restrictions"

**Status:** `submitted`
**PR oficial:** https://github.com/SynkraAI/aios-core/pull/542
**Issue relacionada:** #527
**Submetido em:** 2026-03-02
**Reviewers solicitados:** Pedrovaleriolopez, oalanicolas

---

## O que resolve

Três instruções simultâneas diziam ao `@aios-master` para executar qualquer task diretamente, sobrepondo as regras de delegação:

| Localização | Instrução problemática |
|-------------|----------------------|
| `agent-authority.md:74` | `Execute ANY task directly \| No restrictions` |
| `aios-master.md` identity | `Universal executor... executes any task directly` |
| `core_principles[0]` | `Execute any resource directly without persona transformation` |

## Mudanças

- `agent-authority.md`: tabela `No restrictions` → tabela precisa com delegation-first + tabela de delegação por task + escape hatch `--force-execute`
- `aios-master.md`: identity corrigida + `core_principles[0]` virou `MANDATORY PRE-EXECUTION CHECK` + `create-next-story` removido dos commands

## Histórico

- Issue #527 aberta por @vxavierr
- Análise técnica de @nikolasdehor confirmando 3 camadas de contradição
- Implementação testada no HUB antes de submeter
- PR fechado e reaberto para ajuste de texto (tradução para português)
