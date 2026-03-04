# Lessons Learned — AIOS HUB

## [2026-03-02] @aios-master: improve-self executado corretamente — docs atualizados

**Situação:** Usuário invocou `*task improve-self atualize os helps e toda a documentação do AIOS para refletir a task de improve-self`.

**O que foi feito:** Seguido o fluxo de 8 steps da task. Step 7 apresentou plano ao usuário e obteve aprovação explícita. Step 8 aplicou 3 mudanças de documentação:
1. `aios-master.md` — adicionada seção "Meta-Improvement" nos Quick Commands
2. `aios-master.md` — adicionado step 8 "Self-improvement" no Typical Workflow do Guide
3. `development/README.md` — adicionada categoria "Meta-Improvement" em Task Categories

**Aprendizado:** A task `improve-self.md` funciona para mudanças de documentação além de código. O fluxo de aprovação (Step 7) é adequado para qualquer tipo de mudança.

---

## [2026-03-02] @aios-master: task activation não aconteceu automaticamente

**Situação:** Usuário invocou `*propose-improvement --direct`. A task correta é `improve-self.md`.

**O que aconteceu:** Ignorei a task file e executei análise + implementação no improviso, sem seguir os 8 steps definidos na task.

**Causa:** Não há mecanismo automático que force o carregamento da task — depende de disciplina do agente em fazer `Read(task-file.md)` como PRIMEIRO tool call ao receber qualquer `*comando`.

**Regra a seguir:** Ao receber `*comando`, o PRIMEIRO tool call SEMPRE deve ser o `Read` da task file correspondente. Nunca analisar, propor ou implementar antes de ler a task.

**Mapeamento correto:**
- `*propose-improvement` → `improve-self.md`
- `*propose-modification` → `propose-modification.md`
- `*create agent` → `create-agent.md`
- etc.
