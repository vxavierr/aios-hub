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
