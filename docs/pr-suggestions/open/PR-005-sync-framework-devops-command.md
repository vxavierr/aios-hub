# PR-005 — Comando `*sync-framework` no @devops

**Status:** `draft`
**Esforço:** Pequeno
**Impacto:** Médio (operacional)
**Depende de:** —

---

## Problema

Em deployments multi-projeto (como o HUB), cada projeto tem sua própria cópia de `.aios-core/development/`. Mudanças no framework feitas no repositório principal não propagam automaticamente para os projetos — criando drift silencioso.

Não há mecanismo para saber quais projetos estão desatualizados nem para propagar updates de forma controlada.

---

## Solução proposta

Adicionar o comando `*sync-framework` ao `@devops` com uma task correspondente:

```bash
# Sincroniza development/ do HUB para todos os projetos
*sync-framework

# Sincroniza apenas um projeto específico
*sync-framework mindo
```

A task correspondente (`sync-framework.md`) executaria:
1. Listar projetos em `projects/`
2. Para cada projeto com `.aios-core/development/`: copiar o conteúdo do HUB
3. Preservar `core-config.yaml` de cada projeto (configuração projeto-específica)
4. Reportar o que foi atualizado

---

## Arquivos afetados

| Arquivo | Mudança |
|---------|---------|
| `.aios-core/development/tasks/sync-framework.md` | Criar task |
| `.aios-core/development/agents/devops.md` | Adicionar comando `*sync-framework` |

---

## Implementação local

Script já criado em `D:/workspace/scripts/sync-framework.sh`. A task no @devops seria um wrapper que chama esse script ou replica a lógica de forma portável.

---

## Contra-argumentos mapeados

- Só resolve projetos no mesmo filesystem (não projetos em VPS ou máquinas diferentes)
- Para casos multi-máquina, a solução seria git submodule — que tem custo maior de manutenção

---

## Notas

Valor imediato para deployments locais. Para multi-máquina, documentar como limitação conhecida.
