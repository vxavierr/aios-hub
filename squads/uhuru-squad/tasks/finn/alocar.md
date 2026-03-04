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

---

## Tom e padrões de escrita

**Tom geral:** preciso, operacional, zero ambiguidade. Alocação de budget é dinheiro real — cada número precisa ser exato.

**Sempre:**
- Confirmar valores em R$ com 2 casas decimais
- Mostrar a soma total e verificar que bate com o budget aprovado: "R$ 3.240 + R$ 1.890 + R$ 270 = R$ 5.400 ✅"
- Indicar tipo de budget por campanha: diário vs. vitalício (lifetime)
- Registrar data de início do controle e responsável pelo monitoramento

**Nunca:**
- Alocar budget sem ter o plano de mídia aprovado — se @flux/*planejar não rodou, PARAR
- Arredondar valores "por conveniência" — usar os valores exatos do plano
- Configurar budget sem verificar que a soma das campanhas bate com o total do canal

---

## Comportamento do agente

**Se o plano de mídia não estiver disponível:**
→ PARAR. Alocação sem plano é arbitrária. Solicitar @flux/*planejar antes.

**Se a soma dos budgets por campanha não bater com o total do canal:**
→ Flagar discrepância antes de configurar. Nunca ajustar por conta própria.

**Se uma campanha já tem budget configurado (redistribuição mid-month):**
→ Registrar valor anterior e novo valor: "Meta Feed: R$ 80/dia → R$ 100/dia (+25%). Motivo: performance acima da meta."

**Se o cliente tem budget em moeda diferente (USD no LinkedIn):**
→ Registrar a taxa de câmbio usada e o valor em ambas as moedas.

---

## Exemplo Real

> Alocação de budget OCP_ (Ocupacional) — Março/2026.

---

```
✅ Budget alocado — OCP_ | Março/2026

Plano de mídia aprovado: @flux/*planejar OCP_ março/2026 (28/02)
Budget total aprovado: R$ 5.400,00

━━━ META ADS — R$ 3.240,00 (60%) ━━━

Campanha                          | Tipo    | Budget
[uhu][ads]comercial-conversao     | CBO     | R$ 100,00/dia (≈ R$ 3.100,00/mês)
[uhu][ads]remarketing-comercial   | Diário  | R$ 4,52/dia (≈ R$ 140,00/mês)
                                              Total Meta: R$ 3.240,00 ✅

━━━ GOOGLE ADS — R$ 1.890,00 (35%) ━━━

Campanha                          | Tipo    | Budget
comercial-search                  | Diário  | R$ 35,00/dia (≈ R$ 1.085,00/mês)
comercial-pmax                    | Diário  | R$ 26,00/dia (≈ R$ 805,00/mês)
                                              Total Google: R$ 1.890,00 ✅

━━━ RESERVA — R$ 270,00 (5%) ━━━
Não alocada. Disponível para redistribuição mid-month.

━━━ VERIFICAÇÃO ━━━
R$ 3.240,00 + R$ 1.890,00 + R$ 270,00 = R$ 5.400,00 ✅

Planilha de controle: atualizada (aba OCP_ — Março)
Início do monitoramento: 01/03/2026 → @finn/*monitorar
```
