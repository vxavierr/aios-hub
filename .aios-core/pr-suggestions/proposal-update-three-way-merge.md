# Proposal: Three-Way Merge no Update

**ID:** proposal-update-three-way-merge
**Data:** 2026-03-02
**Agente:** @aios-master (Orion)
**Status:** implemented
**Prioridade:** high
**Tipo:** enhance

---

## Problema

`update-aios.sh` usava `rsync` puro para sincronizar arquivos do upstream. Qualquer arquivo presente em **ambos** local e upstream era sobrescrito pelo upstream — incluindo `core-config.yaml`, que contém configurações críticas do projeto (IDE, paths, version, auto_improvement, etc.).

**Regra anterior:**
```
LOCAL + UPSTREAM → UPSTREAM VENCE (rsync sobrescreve)
```

`core-config.yaml` está listado em `install-manifest.yaml` como arquivo instalado do upstream, portanto era afetado.

---

## Solução Implementada

Three-way merge via `git merge-file` para arquivos protegidos:

```
BASE     = última versão upstream salva em .aios-core/.update-base/
LOCAL    = versão atual com customizações do usuário
UPSTREAM = nova versão do SynkraAI/aios-core

RESULTADO = merge de (upstream - base) aplicado no local
```

**Arquivos protegidos:**
- `core-config.yaml` → three-way merge (nunca sobrescreve)
- `pr-suggestions/` → excluído do rsync (nunca tocado)

**Base storage:**
- `.aios-core/.update-base/` — salvo após cada update, gitignored

---

## Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `.aios-core/scripts/update-aios.sh` | v5.2 → v6.0: three-way merge logic + rsync excludes |
| `.aios-core/development/tasks/update-aios.md` | v4.0.0 → v5.0.0: doc atualizada |
| `.gitignore` | `.aios-core/.update-base/` adicionado |

---

## Comportamento Resultante

| Cenário | Antes | Depois |
|---------|-------|--------|
| `core-config.yaml` difere do upstream | Sobrescrito | Three-way merge |
| `core-config.yaml` igual ao upstream | Sem mudança | Sem mudança |
| Conflito no merge | n/a | Conflict markers + aviso |
| `pr-suggestions/` | Destruído se existir no upstream | Nunca tocado |
| Primeiro update (sem base) | Sobrescrito | Local mantido, base salva |

---

## Verificação

```bash
bash -n .aios-core/scripts/update-aios.sh  # ✅ syntax OK
```
