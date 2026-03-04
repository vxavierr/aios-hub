# Task: Monitorar Budget Diário

**Agente:** @finn
**Comando:** `*monitorar [{cliente}]`
**Frequência:** Diária
**Dor:** Maior dor operacional da squad — atualização manual do controle de budget

---

## Objetivo

Verificar e atualizar o controle de budget de todos os clientes (ou de um cliente específico), garantindo que os investimentos estão dentro do previsto e identificando desvios.

---

## Inputs

- `{cliente}` (opcional) — se vazio, monitora todos os clientes
- Planilha de controle de budget (Google Sheets)
- Dados das plataformas: Meta Ads, Google Ads, LinkedIn

---

## Execução

### Passo 1 — Verificar gasto do dia nas plataformas

Para cada cliente ativo:
1. Acessar Meta Ads Manager → verificar gasto de hoje vs. planejado
2. Acessar Google Ads → verificar gasto de hoje vs. planejado
3. Se cliente tem LinkedIn → verificar LinkedIn Campaign Manager

**O que verificar:**
- Gasto do dia atual
- Gasto acumulado do mês
- Projeção de fechamento do mês (pace)
- Campanhas com gasto zero (possível problema)
- Campanhas com overspend

### Passo 2 — Atualizar planilha de controle

Abrir planilha de controle de budget no Google Sheets:
1. Preencher coluna do dia com gastos reais de cada cliente/canal
2. Verificar se o pace está no caminho certo (dentro de ±10% do planejado)
3. Marcar alertas: 🔴 overspend, 🟡 underspend, 🟢 no pace

### Passo 3 — Identificar ações necessárias

**Se overspend (>110% do ritmo):**
- Reduzir budget das campanhas afetadas
- Registrar ajuste no Notion

**Se underspend (<90% do ritmo):**
- Verificar se há campanhas pausadas ou com problema
- Escalar budget se performance está boa
- Acionar @nova se suspeita de problema técnico

### Passo 4 — Output

Resumo diário de budget:
```
📊 Budget Report — {data}
{cliente}: R$ {gasto_dia} / R$ {meta_dia} | Mês: R$ {gasto_mes} / R$ {meta_mes} | {status}
```

---

## Outputs

- [ ] Planilha de budget atualizada
- [ ] Alertas identificados e documentados
- [ ] Ajustes de budget executados (se necessário)
- [ ] Resumo do dia registrado

---

## Escalonamento

- Overspend >120% → informar @flux imediatamente
- Campanha zerada sem explicação → acionar @nova para diagnóstico
- Budget do mês quase esgotado na 3ª semana → acionar @flux para revisão de estratégia

---

## Tom e padrões de escrita

**Tom geral:** operacional, conciso, orientado a alerta. O report diário deve ser escaneável em 30 segundos — cores e status são mais importantes que texto.

**Sempre:**
- Usar indicadores visuais: 🟢 no pace (±10%), 🟡 underspend (<90%), 🔴 overspend (>110%)
- Mostrar gasto do dia + acumulado do mês + projeção de fechamento na mesma linha
- Incluir pace ideal vs. pace real: "Dia 15/28: deveria ter gasto 53,6% → gastou 48,2% (underspend)"
- Listar campanhas com gasto zero separadamente — gasto zero é sempre alerta
- Registrar hora da verificação para rastreabilidade

**Nunca:**
- Reportar sem verificar TODAS as plataformas do cliente — não omitir canal
- Ignorar underspend leve — underspend de 10-15% por 5+ dias vira 20-30% no fechamento
- Fazer ajustes de budget sem registrar na planilha E no Notion
- Reportar só os clientes com problema — o report cobre TODOS os clientes ativos

---

## Comportamento do agente

**Se uma plataforma estiver indisponível (API fora, Manager com erro):**
→ Registrar: "⚠️ Meta Ads Manager indisponível às {hora}. Verificar novamente em 2h." Não pular o cliente.

**Se o pace estiver no caminho certo para todos os clientes:**
→ Report curto: "🟢 Todos no pace. Nenhuma ação necessária." Não inventar problemas.

**Se houver feriado ou fim de semana prolongado no período:**
→ Ajustar o pace ideal considerando que gasto em feriado costuma ser 30-50% menor. Não alertar overspend/underspend baseado em pace linear quando tem feriado.

**Se for a primeira semana do mês:**
→ Pace pode estar instável (algoritmos ainda ajustando). Alertar apenas desvios >25%. Incluir nota: "Primeira semana — pace em estabilização."

---

## Exemplo Real

> Report diário de budget — 15/03/2026.

---

```
📊 Budget Report — 15/03/2026 (Dia 15/31)

OCP_ (Ocupacional)
├─ Meta Ads:   R$ 48,20 hoje | Mês: R$ 1.580,40 / R$ 3.240 (48,8%) | 🟢 no pace
├─ Google Ads: R$ 72,10 hoje | Mês: R$ 1.120,30 / R$ 1.890 (59,3%) | 🟡 acima do pace (+10,9%)
└─ TOTAL:      R$ 120,30 hoje | Mês: R$ 2.700,70 / R$ 5.130 (52,6%) | 🟢

ASM_ (AssisteMed)
├─ Meta Ads:   R$ 25,00 hoje | Mês: R$ 390,50 / R$ 800 (48,8%) | 🟢
├─ Google Ads: R$ 0,00 hoje  | Mês: R$ 310,20 / R$ 700 (44,3%) | 🟡 underspend
└─ TOTAL:      R$ 25,00 hoje | Mês: R$ 700,70 / R$ 1.500 (46,7%) | 🟢

⚠️ ALERTAS:
- OCP_ Google Ads acima do pace (+10,9%) — monitorar nos próximos 3 dias. Se mantiver, reduzir budget diário de PMax em R$ 5.
- ASM_ Google Search com gasto R$ 0 hoje — verificar se campanhas estão ativas.

Verificado às 17:30.
```
