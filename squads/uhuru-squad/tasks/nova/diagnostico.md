# Task: Diagnóstico de Criativos

**Agente:** @nova
**Comando:** `*diagnostico {cliente}`
**Frequência:** Semanal

---

## Objetivo

Analisar os criativos em veiculação — identificar quais estão performando bem, quais estão em fadiga, e recomendar ações (incluindo quais posts devem ser impulsionados).

---

## Inputs

- `{cliente}` — código do cliente
- Dados de criativos do Meta Ads Manager e Google Ads

---

## Execução

### Passo 1 — Listar criativos ativos

No Meta Ads Manager:
- Acessar nível de anúncio
- Filtrar por campanha ativa
- Exportar lista de criativos com métricas: impressões, CTR, CPM, leads, frequência

No Google Ads:
- Verificar RSA (Responsive Search Ads) com asset scores
- Identificar assets com "Aprendendo", "Bom", "Melhor desempenho"

### Passo 2 — Classificar criativos

**Categorias:**
- 🟢 **Campeão** — CTR alto, CPL baixo, frequência ok → manter
- 🟡 **Fadiga** — Frequência >3, CTR caindo → considerar pausa
- 🔴 **Fraco** — CTR baixo, CPL alto → pausar
- 🔵 **Novo** — Menos de 3 dias rodando → aguardar

### Passo 3 — Recomendações de impulsionamento

Analisar posts orgânicos do cliente (se aplicável):
- Posts com bom engajamento orgânico são candidatos a boost
- Recomendar quais posts impulsionar com critério de performance esperada

### Passo 4 — Output

```
🎨 Diagnóstico de Criativos — {cliente}

CAMPEÕES (manter e escalar):
- {nome_criativo}: CTR {%}, CPL R${valor}, Frequência {n}

FADIGANDO (considerar renovação):
- {nome_criativo}: Frequência {n}, CTR caiu {%} vs. semana anterior

PAUSAR:
- {nome_criativo}: CPL R${valor} ({n}x acima da meta)

BOOST RECOMENDADO:
- Post "{título}": {n} engajamentos orgânicos, recomendar R$ {budget} por {n} dias

💡 Ação imediata: {lista de ações concretas}
```

---

## Outputs

- [ ] Mapa de criativos classificados
- [ ] Lista de criativos para pausar
- [ ] Posts para impulsionar com budget sugerido
- [ ] Briefing de novos criativos necessários → @flux/*briefing
