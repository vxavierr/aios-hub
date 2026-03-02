# PR-002 — Integrar lessons.md na pipeline de ativação dos agentes

**Status:** `draft`
**Esforço:** Pequeno (30min)
**Impacto:** Médio
**Depende de:** —

---

## Problema

O Protocol 4 (self-correction) instrui agentes a logar padrões de erro em `docs/lessons/lessons.md`. Mas o arquivo nunca é lido — nenhum agente carrega lessons.md no startup. O LLM não persiste entre sessões, então escrever num arquivo que nunca volta pro contexto é um ritual sem efeito comportamental real.

O loop não fecha:
```
Agente erra → escreve em lessons.md → sessão termina → nova sessão começa do zero
                                                         ↑
                                              lessons.md nunca é lido
```

---

## Solução proposta

Adicionar uma etapa na `unified-activation-pipeline.js` que carrega as últimas N entradas de `docs/lessons/lessons.md` no contexto de ativação, se o arquivo existir:

```javascript
// Na pipeline de ativação, após carregar session/git config:
if (fs.existsSync('docs/lessons/lessons.md')) {
  const lessons = loadLastNLines('docs/lessons/lessons.md', 10);
  context.lessons = lessons; // injetado no greeting context
}
```

E nas activation-instructions dos agentes, adicionar:

```yaml
- STEP 2b: Se lessons foram carregadas no contexto, lê-las antes de começar
           — evita repetir erros já documentados
```

O limite de 10 entradas evita bloat de contexto. O arquivo só é lido se existir — sem efeito em projetos que não o usam.

---

## Arquivos afetados

| Arquivo | Mudança |
|---------|---------|
| `.aios-core/development/scripts/unified-activation-pipeline.js` | Adicionar etapa de carregamento de lessons.md |
| `.aios-core/development/agents/*.md` | Adicionar STEP 2b nas activation-instructions |

---

## Contra-argumentos mapeados

- Pequeno overhead de contexto por sessão (mitigado pelo limite de 10 entradas)
- Agentes não têm garantia de que vão *seguir* os lessons — mas ter no contexto é melhor que não ter

---

## Notas

Esse PR fecha o loop de aprendizado documentado mas nunca funcional. É um dos fixes mais baratos em relação ao impacto potencial.
