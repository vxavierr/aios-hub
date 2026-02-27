# Task: Análise de Leads

**Agente:** @nova
**Comando:** `*leads {cliente}`
**Frequência:** Semanal

---

## Objetivo

Analisar a planilha de leads do cliente — qualidade, volume, origem, conversão — para entender o retorno real das campanhas além das métricas de plataforma.

---

## Inputs

- `{cliente}` — código do cliente
- Planilha de leads do cliente no Google Sheets

---

## Execução

### Passo 1 — Acessar planilha de leads

Abrir planilha de leads do cliente no Google Sheets.

### Passo 2 — Análise de volume

- Total de leads do período (semana/mês)
- Distribuição por canal de origem (Meta, Google, LinkedIn)
- Comparativo com período anterior

### Passo 3 — Análise de qualidade

- Leads válidos vs. inválidos (telefone errado, não atende, etc.)
- Taxa de contato (% de leads que atenderam o SDR/vendedor)
- Taxa de qualificação (% de leads que são o perfil ideal)
- Taxa de agendamento/reunião

### Passo 4 — Análise de conversão

- Leads → Oportunidades → Vendas (se disponível)
- CPL real vs. CPL por plataforma (verificar descrepâncias)
- Qual canal gera leads de maior qualidade?

### Passo 5 — Output

```
📋 Análise de Leads — {cliente} | {período}

Volume: {n} leads ({delta}% vs. anterior)
- Meta Ads: {n} ({%})
- Google Ads: {n} ({%})

Qualidade:
- Leads válidos: {n} ({%})
- Taxa de contato: {%}
- Taxa de qualificação: {%}

CPL real vs. plataforma:
- Meta: R$ {real} vs. R$ {plataforma}
- Google: R$ {real} vs. R$ {plataforma}

💡 Insights: {observações sobre qualidade dos leads}
⚠️ Alertas: {anomalias ou quedas de qualidade}
```

---

## Outputs

- [ ] Análise de volume e qualidade de leads
- [ ] CPL real calculado e comparado
- [ ] Insights sobre canal com melhor qualidade de lead
- [ ] Alertas de queda de qualidade ou volume para @flux
