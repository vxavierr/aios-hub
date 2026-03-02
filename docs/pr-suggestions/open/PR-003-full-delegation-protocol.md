# PR-003 — Protocolo completo de delegação (4 protocolos)

**Status:** `ready`
**Esforço:** Médio
**Impacto:** Alto
**Depende de:** PR #542 mergeado (minimal fix deve estar no main primeiro)

---

## Problema

O PR #542 (minimal fix) corrigiu os sintomas mais críticos — `core_principles[0]` e a tabela `No restrictions`. Mas não introduziu os mecanismos que garantem o comportamento correto de forma sistemática:

1. Não há **formato padrão de rejeição** — agentes improvisant quando recusam tarefas
2. Não há **protocolo de delegação via task file** — delegar sem especificar a task é ambíguo
3. Não há **definição de auto-correção** — agentes tratam "desculpa" como correção
4. O arquivo `handoff-protocol.md` foi apontado por @nikolasdehor como nome conflitante com `agent-handoff.md` existente

---

## Solução proposta

Criar `.claude/rules/delegation-protocol.md` (renomeado de `handoff-protocol.md` conforme sugestão do @nikolasdehor) com os 4 protocolos:

**Protocol 1 — Pre-Execution Check (obrigatório)**
Antes de qualquer task: verificar se existe agente exclusivo. Se sim, rejeitar e delegar.

**Protocol 2 — Mecanismo de delegação via task file**
Delegar = passar o arquivo de task, não só o nome do agente. Sem task file, o agente receptor não sabe o que produzir.

**Protocol 3 — Rejection Script (formato padrão)**
```
SCOPE REJECTION
Reason: [task] é de autoridade exclusiva de @{agent}
Correct action: → @{agent} | task: {task}.md
```

**Protocol 4 — Auto-correção real**
Reverter artefato criado incorretamente + redirecionar + logar em lessons.md.
"Desculpa" não satisfaz o protocolo.

---

## Arquivos afetados

| Arquivo | Mudança |
|---------|---------|
| `.claude/rules/delegation-protocol.md` | Criar — os 4 protocolos completos |
| `.claude/rules/agent-authority.md` | Referenciar delegation-protocol.md |
| `.aios-core/development/agents/aios-master.md` | Adicionar referência ao delegation-protocol nas core_principles |

---

## Implementação local

Já implementado no HUB como `handoff-protocol.md`. Para o PR oficial:
- Renomear para `delegation-protocol.md`
- Ajustar referências no workflow-execution.md e agent-authority.md

---

## Contra-argumentos mapeados

- Adiciona overhead de processo (mitigado pelos protocolos serem leves — verificação antes de executar, não durante)
- Pode causar rejeições excessivas se o Pre-Execution Check for muito agressivo (mitigado pelo `--force-execute` escape hatch)

---

## Notas

Este é o "PR 2 de 2" mencionado no PR #542. @nikolasdehor indicou disponibilidade para fazer review.
