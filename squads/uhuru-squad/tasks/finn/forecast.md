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

---

## Tom e padrões de escrita

**Tom geral:** analítico, preditivo, baseado em tendências. O forecast é a ponte entre o que aconteceu e o que vai acontecer — precisa ser realista, não otimista.

**Sempre:**
- Mostrar histórico de 3 meses quando disponível para contextualizar a projeção
- Separar projeção conservadora vs. otimista quando a variância for alta: "Conservador: 75 leads | Otimista: 95 leads"
- Incluir premissas explícitas: "Premissa: budget mantido em R$ 5.400, sem mudança de estratégia"
- Calcular pace diário e semanal para facilitar o monitoramento posterior
- Vincular forecast ao plano de mídia: "Este forecast alimenta @flux/*planejar para março"

**Nunca:**
- Projetar crescimento linear sem justificativa — se fev teve 87 leads, março não é automaticamente 90+
- Ignorar sazonalidade conhecida (ex: janeiro é fraco, novembro é forte por Black Friday)
- Apresentar forecast sem o fechamento do mês anterior — sem referência, a projeção não tem base
- Usar "esperamos" ou "acreditamos" — usar "projetamos baseado em X"

---

## Comportamento do agente

**Se o histórico disponível for menor que 3 meses:**
→ Usar o que tiver e flagar: "Histórico limitado ({n} meses). Forecast com menor confiabilidade — revisar em 15 dias."

**Se houve mudança significativa de budget (>20% vs. mês anterior):**
→ Não usar projeção linear. Ajustar proporcionalmente e justificar: "Budget +30% → projeção de leads +20% (ganho marginal diminui com escala)."

**Se o CPL dos últimos 3 meses tem tendência de alta:**
→ Alertar explicitamente: "⚠️ CPL subindo há 3 meses (R$ 55 → R$ 62 → R$ 68). Se tendência continuar, forecast de março: CPL ~R$ 73. Recomendar revisão de estratégia com @flux."

**Se o cliente não confirmou budget do próximo mês:**
→ Fazer forecast com o budget atual como base e marcar como "pendente confirmação do cliente".

---

## Exemplo Real

> Forecast OCP_ — Fechamento Fev/2026 + Projeção Mar/2026.

---

```
📈 Forecast — OCP_ | Março/2026

━━━ FECHAMENTO FEVEREIRO ━━━

Canal      | Planejado  | Real       | Desvio
Meta Ads   | R$ 3.000   | R$ 3.180   | +6,0% 🟢
Google Ads | R$ 2.000   | R$ 2.240   | +12,0% 🟠
Total      | R$ 5.000   | R$ 5.420   | +8,4% 🟢

Causa do desvio Google: budget diário ficou R$ 6 acima por 12 dias antes de ajuste.
Impacto: positivo — 7 leads adicionais dentro do CPL meta.

━━━ FORECAST MARÇO ━━━

Canal      | Budget     | Leads Proj. | CPL Proj.
Meta Ads   | R$ 3.240   | 58          | R$ 55,86
Google Ads | R$ 1.890   | 30          | R$ 63,00
Reserva    | R$ 270     | —           | —
Total      | R$ 5.400   | 88          | R$ 58,70

Pace diário: ~R$ 174/dia
Pace semanal: ~R$ 1.215/semana
Leads/semana estimados: ~22

Premissas:
- Budget aprovado pelo cliente (28/02)
- Keywords geolocalizadas adicionadas (redução esperada de CPL Google em 15%)
- 3 novos criativos estáticos Meta (manutenção do CPL Meta)

Histórico (3 meses):
- Dez: 65 leads | CPL R$ 71,50
- Jan: 71 leads | CPL R$ 68,87
- Fev: 87 leads | CPL R$ 62,30
→ Tendência: crescimento consistente em volume + queda de CPL ✅
```
