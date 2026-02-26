# Task: Forecast Mensal de Verba

**Agente:** @finn
**Comando:** `*forecast {cliente} {mês}`
**Frequência:** Mensal (final de mês / início de mês)

---

## Objetivo

Projetar o investimento do próximo mês e fechar o forecast financeiro do mês atual — garantindo alinhamento entre performance e budget disponível.

---

## Inputs

- `{cliente}` — código do cliente
- `{mês}` — mês de referência do forecast
- Histórico de gastos dos últimos 3 meses
- Budget aprovado pelo cliente para o próximo mês

---

## Execução

### Passo 1 — Fechar mês atual

1. Verificar gasto real vs. planejado por canal
2. Calcular desvio em R$ e %
3. Documentar causas de overspend ou underspend

### Passo 2 — Projetar próximo mês

Com base no histórico e no budget aprovado:

**Por canal:**
- Budget Meta Ads: R$ {valor}
- Budget Google Ads: R$ {valor}
- Budget LinkedIn: R$ {valor}
- Total: R$ {valor}

**Pace esperado:**
- Projeção semanal: R$ {total} / 4 semanas ≈ R$ {por semana}
- Projeção diária: R$ {por dia}

### Passo 3 — Análise de eficiência

- CPL/CPA projetado com base no histórico
- Volume de leads/conversões esperado
- ROI projetado (se tiver dados de vendas)

### Passo 4 — Documentar

Atualizar planilha de controle com forecast do próximo mês.

Output:
```
📈 Forecast — {cliente} | {mês}

Fechamento mês anterior:
- Total investido: R$ {real} vs. R$ {planejado} ({desvio}%)
- Desvio: {explicação}

Forecast próximo mês:
- Meta Ads: R$ {valor}
- Google Ads: R$ {valor}
- Total: R$ {valor}

Pace diário: ~R$ {valor}/dia
Leads projetados: ~{n} leads | CPL estimado: R$ {valor}
```

---

## Outputs

- [ ] Fechamento do mês atual documentado
- [ ] Forecast do próximo mês documentado
- [ ] Planilha de controle configurada para o novo mês
- [ ] Alinhamento com @flux/*planejar confirmado
