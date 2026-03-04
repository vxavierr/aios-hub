# Task: Plano de Mídia Mensal

**Agente:** @flux
**Comando:** `*planejar {cliente} {mês}`
**Frequência:** Mensal

---

## Objetivo

Criar ou atualizar o plano de mídia mensal de um cliente — definindo budget por canal, objetivos, estratégia de campanhas e metas de KPIs.

---

## Inputs

- `{cliente}` — código do cliente
- `{mês}` — mês de referência
- Histórico de performance (@nova/*analisar do mês anterior)
- Budget aprovado pelo cliente
- Objetivos de negócio do cliente para o mês

---

## Execução

### Passo 1 — Revisar performance anterior

Consultar análise do mês anterior (@nova/*analisar):
- O que funcionou? O que não funcionou?
- Quais canais tiveram melhor ROI?
- Quais campanhas escalar? Quais pausar?

### Passo 2 — Definir budget por canal

Com base no histórico e no budget total aprovado:
- Distribuição por canal (Meta / Google / LinkedIn)
- Justificativa para cada distribuição
- Reserva estratégica (10-15% para oportunidades)

### Passo 3 — Definir objetivos e metas

Para cada canal:
- Meta de leads/conversões
- Meta de CPL/CPA
- Meta de investimento
- KPIs secundários (CTR, CPM, alcance)

### Passo 4 — Estrutura de campanhas

Definir quais campanhas rodar no mês:
- Campanhas de topo de funil (awareness)
- Campanhas de meio de funil (consideração)
- Campanhas de fundo de funil (conversão)
- Campanhas de remarketing

### Passo 5 — Documentar no Notion

Criar ou atualizar página do plano de mídia no Notion:
```
Cliente: {cliente}
Mês: {mês}
Budget total: R$ {valor}

Canal | Budget | Meta de Leads | CPL Meta
Meta  | R$ {valor} | {n} | R$ {valor}
Google | R$ {valor} | {n} | R$ {valor}

Campanhas planejadas: {lista}
Criativos necessários: {lista} → @flux/*briefing
```

---

## Outputs

- [ ] Plano de mídia documentado no Notion
- [ ] Budget alocado por canal → @finn/*alocar
- [ ] Briefings de criativos necessários criados → *briefing

---

## Tom e padrões de escrita

**Tom geral:** estratégico, fundamentado em dados, orientado a resultado. O plano de mídia é o documento-mãe do mês — todos os outros agentes consultam ele.

**Sempre:**
- Justificar a distribuição de budget por canal com dados do mês anterior: "Meta recebe 60% porque entregou CPL 34% menor que Google em fev"
- Definir metas SMART: específicas, mensuráveis, com número e prazo
- Incluir reserva estratégica (10-15%) para oportunidades ou ajustes mid-month
- Listar campanhas planejadas com objetivo e público esperado — não apenas "campanha de tráfego"
- Referenciar criativos necessários e vincular a *briefing com prazo
- Indicar dependências claras: "Este plano depende do budget aprovado pelo cliente em {data}"

**Nunca:**
- Criar plano sem consultar performance do mês anterior (@nova/*analisar) — plano sem dados é achismo
- Definir metas sem base: "meta de 100 leads" sem justificar de onde veio o número
- Omitir canal inativo — incluir com "Não ativo este mês. Motivo: {razão}"
- Planejar mais campanhas do que o budget suporta — ser realista com o orçamento disponível

---

## Comportamento do agente

**Se @nova/*analisar do mês anterior não estiver disponível:**
→ PARAR. Plano de mídia sem dados é achismo. Solicitar execução antes de prosseguir.

**Se o budget do cliente ainda não estiver aprovado:**
→ Montar plano com cenários: "Cenário A (R$ 5.000): distribuição X. Cenário B (R$ 3.000): distribuição Y." Marcar como "pendente aprovação".

**Se um canal teve CPL 2x acima da meta no mês anterior:**
→ Incluir parágrafo de decisão estratégica: manter com ajustes, reduzir budget, ou pausar. Justificar.

**Se é o primeiro mês do cliente:**
→ Usar benchmarks do setor como referência e marcar todas as metas como "baseline — ajustar após 30 dias". Distribuição 50/50 entre canais até ter dados.

---

## Exemplo Real

> Plano de mídia OCP_ (Ocupacional) — Março/2026.

---

```
Cliente: OCP_ (Ocupacional)
Mês: Março/2026
Budget total: R$ 5.400 (aprovado em 28/02)

Canal     | Budget    | Meta Leads | CPL Meta  | Justificativa
Meta Ads  | R$ 3.240  | 58         | R$ 55,86  | 60% do budget — CPL 34% menor que Google em fev (R$ 62,35 vs R$ 62,22 geral, mas conjunto Feed a R$ 41,20)
Google Ads| R$ 1.890  | 30         | R$ 63,00  | 35% — manter volume com ajuste de keywords geolocalizadas
Reserva   | R$ 270    | —          | —         | 5% — para oportunidades mid-month ou redistribuição

Total     | R$ 5.400  | 88         | R$ 58,70  | Meta: +1,1% leads vs fev (87) com CPL -5,8%

Campanhas planejadas:
- Meta Feed "comercial-conversao" (principal): interesses+site + LAL de leads
- Meta "remarketing-comercial": visitantes sem conversão 7d
- Google Search "comercial-search": keywords ajustadas (adicionar geolocalizadas)
- Google PMax "comercial-pmax": manter configuração atual

Criativos necessários: 3 estáticos novos + 1 vídeo curto teste → @flux/*briefing até 07/03
```
