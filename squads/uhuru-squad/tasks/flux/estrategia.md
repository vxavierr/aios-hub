# Task: Estratégia por Canal

**Agente:** @flux
**Comando:** `*estrategia {cliente} {canal}`
**Frequência:** Mensal ou sob demanda

---

## Objetivo

Definir ou revisar a estratégia de um canal específico para um cliente — estrutura de campanha, segmentações, posicionamento e táticas de crescimento.

---

## Inputs

- `{cliente}` — código do cliente
- `{canal}` — meta | google | linkedin

---

## Execução por Canal

### Meta Ads

1. **Estrutura de conta:**
   - Campanha por objetivo (Leads, Tráfego, Alcance)
   - Conjuntos de anúncios por público-alvo
   - Anúncios por criativo/mensagem

2. **Públicos:**
   - Interesse (topo de funil)
   - Lookalike de leads convertidos (expansão)
   - Remarketing (fundo de funil)

3. **Estratégia de oferta:**
   - Budget da campanha vs. conjunto de anúncios
   - Lance manual vs. automático
   - Meta de custo por resultado

### Google Ads

1. **Estrutura:**
   - Campanhas por intenção (Search, Performance Max, Display)
   - Ad Groups por tema/keyword
   - RSAs com assets otimizados

2. **Keywords:**
   - Brand terms
   - Termos de intenção (produtos/serviços específicos)
   - Termos de solução (problemas que o cliente resolve)
   - Negative keywords

3. **Lance:**
   - Target CPA / Target ROAS
   - Enhanced CPC para campanhas novas

### LinkedIn Ads

1. **Estrutura:**
   - Objective: Lead Gen Forms vs. Website Conversions
   - Segmentação por cargo, setor, tamanho de empresa

2. **Públicos:**
   - Matched audiences (lista de emails, website visitors)
   - Interest targeting por setor

---

## Outputs

- [ ] Estratégia documentada no Notion
- [ ] Recomendações de ajuste de estrutura de conta
- [ ] Briefing de criativos alinhados à estratégia → *briefing

---

## Tom e padrões de escrita

**Tom geral:** estratégico, objetivo, orientado a decisão. Cada recomendação deve ter justificativa baseada em dados — não opinião.

**Sempre:**
- Estruturar por canal com seções visuais separadas — nunca misturar Meta, Google e LinkedIn
- Justificar cada escolha de público, lance ou estrutura com referência a performance anterior quando disponível
- Incluir metas mensuráveis: "Objetivo: CPL < R$ 50" — nunca "melhorar performance"
- Usar nomenclatura padronizada da squad: `[prefixo_cliente][canal]nome-da-campanha`
- Referenciar histórico: "No mês anterior, Lookalike trouxe CPL 30% menor que Interesse"
- Indicar prioridade por campanha: qual é a principal, qual é teste, qual é suporte

**Nunca:**
- Copiar estrutura genérica de agência sem adaptar ao contexto do cliente
- Recomendar públicos ou keywords sem justificativa de dados ou hipótese clara
- Deixar estratégia sem metas de KPI vinculadas — toda campanha tem um target
- Misturar estratégia com execução operacional (configuração de budget é @finn)

---

## Comportamento do agente

**Se o cliente não tem histórico (conta nova ou canal novo):**
→ Montar estratégia baseada em benchmarks do setor + hipóteses explícitas. Marcar como "baseline — revisar após 30 dias".

**Se o canal anterior teve performance muito ruim (CPL 2x acima da meta):**
→ Propor reestruturação da conta antes de definir nova estratégia. Flagar: "Estrutura atual não sustenta — recomendar reestruturação antes de escalar."

**Se o cliente tem apenas 1 canal ativo:**
→ Não criar seção vazia para canais inativos. Focar no canal ativo e incluir 1 parágrafo de recomendação sobre expansão para outros canais.

**Se o budget do cliente for muito limitado (< R$ 2.000/mês):**
→ Recomendar concentração em 1 canal ao invés de diluir. Justificar qual canal priorizar baseado no tipo de negócio.

---

## Exemplo Real

> Estratégia Meta Ads para OCP_ (Ocupacional) — Março/2026.

---

### Meta Ads — OCP_ | Março/2026

**1. Estrutura de conta:**
- Campanha 1 (principal): `[uhu][ads]comercial-conversao` — objetivo Leads
  - Conjunto "interesses+site": público de interesse (saúde ocupacional, segurança do trabalho) + visitantes do site
  - Conjunto "lookalike": LAL 1-3% de leads convertidos nos últimos 90 dias
- Campanha 2 (remarketing): `[uhu][ads]remarketing-comercial` — objetivo Leads
  - Conjunto "visitantes-site-7d": visitantes que não converteram nos últimos 7 dias

**2. Públicos:**
- Topo: Interesses em SST, medicina do trabalho, eSocial — empresários e RH em MG
- Expansão: Lookalike 1% de leads qualificados (base: 87 leads de fev/2026)
- Fundo: Remarketing de visitantes do site sem conversão

**3. Estratégia de oferta:**
- CBO (Campaign Budget Optimization) na campanha principal
- Budget: R$ 100/dia → ~R$ 3.000/mês
- Lance: Custo mais baixo (deixar algoritmo otimizar — performance estável)
- Meta: CPL < R$ 55 (fev fechou em R$ 62,35 — objetivo é reduzir 12%)

**Justificativa:** Em fevereiro, o conjunto "interesses+site" entregou 34 leads a CPL R$ 41,20 — 34% abaixo da média. Priorizar este conjunto com 60% do budget e testar LAL com 40%.

---

### Google Ads — OCP_ | Março/2026

**1. Estrutura de conta:**
- Campanha 1 (principal): `comercial-search` — Search com keywords de intenção
  - Ad Group "saúde ocupacional": termos core do negócio
  - Ad Group "geolocalizados": termos cidade + serviço (melhor CPA da conta)
  - Ad Group "compliance": termos eSocial, NR, PCMSO
- Campanha 2 (performance max): `comercial-pmax` — cobertura ampla com assets otimizados
  - Grupo "Comercial Geral": assets focados em conversão

**2. Keywords:**
- **Brand:** "ocupacional medicina do trabalho", "grupo ocupacional"
- **Intenção alta:** "medicina do trabalho betim" (exata), "sst contagem" (exata), "pcmso bh" (frase)
- **Intenção média:** "saúde ocupacional empresas" (frase), "exame admissional" (frase)
- **Negativas:** "salário", "curso", "concurso", "vagas", "o que é" — termos informacionais
- **Novas (teste):** "medicina do trabalho vespasiano", "sst santa luzia", "ocupacional betim"

**3. Lance:**
- Search: Target CPA R$ 55 (fev fechou em R$ 62,22 — objetivo de redução via geolocalizados)
- PMax: Maximize conversions (budget R$ 26/dia)
- Keywords geolocalizadas: lance manual R$ 2,50-3,00 (volume baixo, CPA excelente — não usar automático)

**Justificativa:** Termos geolocalizados mostraram CPA 10x menor que genéricos em fev (R$ 5,03 vs R$ 48,45). Expandir cobertura geográfica mantendo correspondência exata para controlar qualidade. Restringir "medicina do trabalho" de broad para frase — volume caiu 60% com CPA +71% em broad.
