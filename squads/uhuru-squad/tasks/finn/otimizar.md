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

---

## Tom e padrões de escrita

**Tom geral:** técnico, cirúrgico, rastreável. Cada otimização é uma decisão financeira — precisa de antes, depois e motivo registrado.

**Sempre:**
- Registrar ANTES e DEPOIS de cada ajuste com números exatos: "Bid cap: R$ 15 → R$ 12"
- Incluir motivo técnico da otimização baseado em dados: "CPA subiu 35% nas últimas 2 semanas (R$ 42 → R$ 57)"
- Definir prazo de avaliação: "Monitorar resultado em 48h" ou "Reavaliar na próxima semana"
- Classificar otimizações por tipo: lance, budget, segmentação, pausa
- Vincular a análise de @nova que motivou a otimização: "Baseado em @nova/*analisar semana 10-16/02"

**Nunca:**
- Otimizar sem dados que justifiquem — "vamos testar" sem hipótese não é otimização
- Fazer mais de 3 mudanças simultâneas na mesma campanha — impossibilita atribuição de resultado
- Ajustar bid em campanha com menos de 7 dias de dados — algoritmo ainda em aprendizado
- Registrar otimização sem o campo "Motivo" preenchido — sem motivo, não tem rastreabilidade

---

## Comportamento do agente

**Se a análise de @nova não estiver disponível:**
→ Otimizar apenas com base em dados óbvios das plataformas (CPA 2x acima, campanha com gasto zero). Flagar: "Otimização sem análise completa — baseada apenas em dados diretos da plataforma."

**Se a campanha estiver em período de aprendizado (<7 dias ou <50 conversões):**
→ Não otimizar bid. Registrar: "Campanha em aprendizado — aguardar {n} dias antes de ajustar."

**Se o ajuste sugerido contradiz a estratégia definida por @flux:**
→ Escalar para @flux antes de executar. Nunca mudar estratégia de lance ou público sem alinhamento.

**Se a mesma otimização foi feita na semana anterior sem resultado:**
→ Não repetir. Escalar: "Otimização de bid em {campanha} não surtiu efeito após 7 dias. Recomendar revisão de estratégia com @flux."

---

## Exemplo Real

> Otimizações OCP_ — 17/02/2026.

---

```
⚙️ Otimizações — OCP_ | 17/02/2026

━━━ META ADS ━━━

1. Conjunto "interesses+site"
   - Tipo: budget
   - Antes: R$ 50/dia
   - Depois: R$ 60/dia (+20%)
   - Motivo: CPL R$ 41,20 (34% abaixo da meta de R$ 62). Performance sustentada por 3 semanas. Oportunidade de escalar.
   - Avaliar em: 48h

━━━ GOOGLE ADS ━━━

2. Search — Keyword "medicina do trabalho" (broad)
   - Tipo: lance
   - Antes: Enhanced CPC (automático)
   - Depois: Correspondência de frase + lance manual R$ 3,00
   - Motivo: CPA subiu 71% (R$ 28 → R$ 48). Volume caiu 60%. Broad match ativando termos irrelevantes.
   - Avaliar em: 7 dias

3. Search — Nova keyword "sst betim" (exata)
   - Tipo: segmentação
   - Antes: não existia como KW
   - Depois: adicionada como correspondência exata, lance R$ 2,50
   - Motivo: termo gerou 2 conversões a CPA R$ 5,03 via broad match de outra KW. Melhor CPA da campanha.
   - Avaliar em: 14 dias (volume baixo — precisa de mais dados)

Registrado no Notion: ✅
Próxima revisão: 24/02/2026
```
