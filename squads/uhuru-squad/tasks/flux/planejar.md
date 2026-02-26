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
