# Task: Alocar Orçamento por Canal

**Agente:** @finn
**Comando:** `*alocar {cliente} [{canal}]`
**Frequência:** Mensal (início) / Pontual (redistribuição)

---

## Objetivo

Configurar e distribuir o budget do cliente nas plataformas de mídia, alinhado ao plano de mídia definido por @flux.

---

## Inputs

- `{cliente}` — código do cliente
- `{canal}` — meta | google | linkedin | all (padrão: all)
- Plano de mídia do mês (@flux/*planejar) com budget aprovado por canal

---

## Execução

### Passo 1 — Confirmar budget aprovado

Verificar no plano de mídia:
- Budget total do cliente para o mês
- Distribuição planejada por canal
- Budget reserva (se houver)

### Passo 2 — Configurar budget nas plataformas

**Meta Ads:**
1. Acessar Meta Ads Manager do cliente
2. Configurar budget por campanha (budget diário ou vitalício)
3. Verificar se a soma dos budgets = budget Meta planejado
4. Distribuir conforme prioridade de campanha

**Google Ads:**
1. Acessar Google Ads do cliente
2. Configurar budget por campanha
3. Verificar budget de Shared Budget se aplicável

**LinkedIn (se aplicável):**
1. Acessar LinkedIn Campaign Manager
2. Configurar budget por campanha

### Passo 3 — Atualizar planilha de controle

Registrar no Google Sheets:
- Budget alocado por canal confirmado
- Início do período de controle

### Passo 4 — Output

```
✅ Budget alocado — {cliente} | {mês}
- Meta Ads: R$ {valor} ({n} campanhas)
- Google Ads: R$ {valor} ({n} campanhas)
- LinkedIn: R$ {valor} ({n} campanhas)
Total: R$ {valor}
```

---

## Outputs

- [ ] Budget configurado nas plataformas
- [ ] Planilha de controle atualizada
- [ ] Início do monitoramento diário (@finn/*monitorar)
