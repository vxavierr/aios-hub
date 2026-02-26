# Task: Analisar Campanha (Big Numbers)

**Agente:** @nova
**Comando:** `*analisar {cliente} [{período}]`
**Frequência:** Semanal (Big Numbers) / Pontual (diagnóstico)

---

## Objetivo

Análise profunda de performance das campanhas de um cliente. Gera o Big Numbers semanal e identifica oportunidades de otimização.

---

## Inputs

- `{cliente}` — código do cliente
- `{período}` — semana | mês | {data_inicio}-{data_fim} (padrão: semana atual)

---

## Execução

### Passo 1 — Coletar dados (ou usar dados já extraídos via *extrair)

Se dados não foram extraídos ainda → executar *extrair primeiro.

### Passo 2 — Big Numbers por canal

Para cada canal ativo do cliente:

**Métricas obrigatórias:**
- Investimento total do período
- Impressões e alcance
- CTR (Click-Through Rate)
- CPM (Custo por mil impressões)
- Cliques e CPC
- Leads gerados
- CPL (Custo por Lead)
- Taxa de conversão (lead/clique)

**Comparativo:**
- vs. período anterior (semana/mês passado)
- vs. meta definida no plano de mídia

### Passo 3 — Análise de campanhas individuais

Identificar:
- Top 3 campanhas com melhor CPL
- Bottom 3 campanhas com pior CPL
- Criativos com melhor CTR
- Campanhas com alta frequência (possível fadiga)
- Campanhas com baixa entrega (problema de aprovação/budget)

### Passo 4 — Oportunidades de otimização

Para cada oportunidade identificada:
- Descrever o problema/oportunidade
- Recomendar ação concreta
- Definir responsável: @finn (budget) ou @flux (estratégia)

### Passo 5 — Output Big Numbers

```
📊 Big Numbers — {cliente} | {período}

META ADS
- Investido: R$ {valor}
- Leads: {n} | CPL: R$ {valor} ({delta}% vs. período anterior)
- CTR: {%} | CPM: R$ {valor}

GOOGLE ADS
- Investido: R$ {valor}
- Conversões: {n} | CPA: R$ {valor} ({delta}%)
- CTR: {%}

TOTAL
- Investimento: R$ {valor}
- Leads totais: {n}
- CPL médio: R$ {valor}

⚠️ Alertas: {lista de alertas}
✅ Destaques: {lista de bons resultados}
💡 Recomendações: {lista de ações}
```

---

## Outputs

- [ ] Big Numbers compilado para o período
- [ ] Análise de campanhas individuais
- [ ] Lista de oportunidades de otimização
- [ ] Dados prontos para @sage/*relatorio ou *dashboard
