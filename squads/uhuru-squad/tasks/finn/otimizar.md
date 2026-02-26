# Task: Otimizar Bid Estratégico

**Agente:** @finn
**Comando:** `*otimizar {cliente} {campanha}`
**Frequência:** Semanal / Sob demanda

---

## Objetivo

Ajustar estratégias de lance e bid nas plataformas para maximizar resultados dentro do budget, e registrar todas as otimizações no Notion para rastreabilidade.

---

## Inputs

- `{cliente}` — código do cliente
- `{campanha}` — nome/ID da campanha (ou "all" para todas)
- Análise de performance recente (@nova/*analisar)

---

## Execução

### Passo 1 — Identificar oportunidades

Com base nos dados de performance:
- Campanhas com CPL acima da meta → oportunidade de ajuste
- Campanhas com CPL abaixo da meta e volume baixo → oportunidade de escalar
- Públicos/palavras-chave com melhor CPA → candidatos a aumento de bid

### Passo 2 — Executar otimizações de bid

**Meta Ads:**
- Ajustar limite de bid (se usando bid cap)
- Mudar estratégia de lance (ex: custo mais baixo → custo meta)
- Ajustar budget das campanhas com melhor desempenho

**Google Ads:**
- Ajustar Target CPA / Target ROAS
- Bid adjustment por dispositivo, localização, horário
- Ajustar bids de keywords manualmente (se Search manual)

**LinkedIn:**
- Ajustar CPM/CPC máximo
- Revisar automated bidding settings

### Passo 3 — Registrar no Notion

**OBRIGATÓRIO:** Toda otimização deve ser registrada no Notion.

Template de registro:
```
Data: {data}
Cliente: {cliente}
Plataforma: {plataforma}
Campanha: {nome}
Otimização: {o que foi feito}
Antes: {métrica antes}
Depois esperado: {métrica esperada}
Motivo: {por que essa otimização foi feita}
```

### Passo 4 — Output

```
⚙️ Otimizações — {cliente} | {data}

Meta Ads:
- {campanha}: bid {antes} → {depois} | motivo: {razão}

Google Ads:
- {campanha}: Target CPA R${antes} → R${depois}

Registrado no Notion: ✅
```

---

## Outputs

- [ ] Bids ajustados nas plataformas
- [ ] Todas as otimizações registradas no Notion
- [ ] Monitoramento agendado para verificar resultado em 48h
