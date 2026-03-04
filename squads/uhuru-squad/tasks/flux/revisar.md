# Task: Revisão de Objetivos

**Agente:** @flux
**Comando:** `*revisar {cliente}`
**Frequência:** Mensal (início de ciclo) ou sob demanda

---

## Objetivo

Revisar e realinhar os objetivos de negócio e metas de mídia do cliente para o próximo ciclo — garantindo que as campanhas estão conectadas com o que o cliente realmente precisa.

---

## Inputs

- `{cliente}` — código do cliente
- Performance do período anterior (@nova/*analisar)
- Objetivos definidos no plano de mídia anterior (@flux/*planejar)

---

## Execução

### Passo 1 — O que foi prometido vs. entregue?

Comparar metas definidas vs. resultados reais:
- Meta de leads: {meta} vs. {real}
- Meta de CPL: R$ {meta} vs. R$ {real}
- Meta de investimento: R$ {meta} vs. R$ {real}

### Passo 2 — Por que houve desvio? (se houver)

Causas raiz:
- Sazonalidade
- Criativos fracos
- Budget insuficiente
- Problema de produto/oferta do cliente
- Concorrência agressiva

### Passo 3 — Revisar objetivos do próximo período

Com base na análise:
- Metas realistas para o próximo mês
- Ajustes necessários na estratégia
- Alinhamento com o cliente (se necessário)

### Passo 4 — Documentar no Notion

Atualizar página do cliente no Notion com:
- Revisão de objetivos assinada
- Metas do próximo período
- Estratégia atualizada

---

## Outputs

- [ ] Análise de metas vs. realizado
- [ ] Causas de desvio identificadas
- [ ] Novos objetivos definidos e documentados
- [ ] Plano de mídia do próximo ciclo atualizado → *planejar

---

## Tom e padrões de escrita

**Tom geral:** analítico, honesto, sem florear. A revisão é o momento de verdade — o que prometemos vs. o que entregamos. Sem desculpas, com diagnóstico.

**Sempre:**
- Mostrar metas vs. realizado lado a lado com delta em R$ e %: "Meta: 80 leads → Real: 87 leads (↑ 8,8%)"
- Classificar desvios por gravidade: 🟢 dentro do esperado (±10%), 🟠 desvio moderado (10-25%), 🔴 desvio crítico (>25%)
- Identificar causas raiz, não sintomas: "CPL subiu" é sintoma — "concorrência aumentou lances em termos genéricos" é causa
- Vincular cada novo objetivo ao aprendizado do período: "Meta CPL R$ 55 → porque geolocalizados mostraram potencial de reduzir custo em 40%"
- Fechar com decisão clara: manter, ajustar ou pivotar — nunca "vamos ver"

**Nunca:**
- Apresentar desvio sem causa: todo número fora da meta tem uma explicação, nem que seja "dados insuficientes para determinar"
- Ajustar metas para cima sem justificativa — se a meta era 80 e trouxe 60, a meta do próximo mês não é 60 automaticamente
- Ignorar canal que foi pausado ou teve budget zerado — registrar o motivo explicitamente
- Usar linguagem defensiva: "apesar dos desafios" — preferir "o CPL subiu 23% por X, vamos corrigir com Y"

---

## Comportamento do agente

**Se as metas do período anterior não estiverem documentadas:**
→ PARAR. Sem metas definidas, não há revisão possível. Solicitar o plano de mídia do período.

**Se todos os KPIs atingiram a meta:**
→ Não forçar problemas. Registrar "Metas atingidas — consolidar estratégia atual" e focar nas oportunidades de melhoria incremental.

**Se houve mudança de budget mid-month (cliente cortou ou aumentou verba):**
→ Registrar explicitamente na seção de contexto. Recalcular metas proporcionalmente ao budget real.

**Se o cliente não respondeu sobre objetivos do próximo período:**
→ Propor metas baseadas no histórico e marcar como "sugestão — pendente aprovação do cliente".

---

## Exemplo Real

> Revisão de objetivos OCP_ — Fevereiro/2026 → Março/2026.

---

```
📋 REVISÃO DE OBJETIVOS — OCP_ | Fevereiro/2026

━━━ METAS vs. REALIZADO ━━━

KPI          | Meta     | Real     | Delta    | Status
Investimento | R$ 5.000 | R$ 5.420 | +8,4%    | 🟢
Leads totais | 80       | 87       | +8,8%    | 🟢
CPL médio    | R$ 62,50 | R$ 62,30 | -0,3%    | 🟢
Leads Meta   | 45       | 51       | +13,3%   | 🟢
Leads Google | 35       | 36       | +2,9%    | 🟢

━━━ DESVIOS E CAUSAS ━━━

🟠 Investimento +8,4% acima do planejado
- Causa: budget diário do Meta ficou R$ 6/dia acima por 12 dias antes de ajuste
- Impacto: positivo — o excesso gerou 7 leads adicionais com CPL dentro da meta

🟠 Google Pesquisa com CPA +23% vs. janeiro
- Causa: concorrência crescente nos termos "medicina do trabalho" (broad match)
- Ação: restringir para correspondência de frase + adicionar termos geolocalizados

━━━ NOVOS OBJETIVOS — MARÇO/2026 ━━━

KPI          | Meta Março  | Base
Investimento | R$ 5.400    | Budget aprovado pelo cliente
Leads totais | 88          | +1,1% vs fev (crescimento conservador)
CPL médio    | R$ 58,70    | -5,8% — alavancado por geolocalizados
CPL Meta     | R$ 55,86    | Manter tendência de queda
CPL Google   | R$ 63,00    | Ajuste de keywords deve reduzir vs R$ 62,22

→ Próximo passo: @flux/*planejar OCP_ março/2026
```
