# Task: Relatório de Resultados

**Agente:** @sage
**Comando:** `*relatorio {cliente} [{período}]`
**Frequência:** Mensal

---

## Objetivo

Gerar o relatório de resultados do cliente para o período — compilando dados de @nova em uma narrativa clara, estruturada e orientada ao cliente.

---

## Inputs

- `{cliente}` — código do cliente
- `{período}` — mês | semana | {data_inicio}-{data_fim}
- Big Numbers do período (@nova/*analisar)
- Análise de leads (@nova/*leads)

---

## Execução

### Passo 1 — Coletar dados

Confirmar que @nova executou *analisar e *leads para o período.
Se não → solicitar antes de prosseguir.

### Passo 2 — Estrutura do relatório

**Seção 1: Resumo Executivo**
- Total investido no período
- Total de leads/conversões
- CPL médio
- Comparativo vs. mês anterior (delta %)
- Destaques positivos e pontos de atenção

**Seção 2: Performance por Canal**
Para cada canal ativo:
- Investimento
- Métricas principais (leads, CPL, CTR, CPM)
- Destaque de campanha ou público
- Ação tomada ou recomendada

**Seção 3: Criativos**
- Criativos mais performáticos do período
- Criativos pausados/fadigados
- Novos criativos a produzir

**Seção 4: Insights e Próximos Passos**
- 3 principais aprendizados do período
- 3 ações planejadas para o próximo período

### Passo 3 — Formatar no Notion

Criar/atualizar página de relatório do cliente no Notion.

---

## Outputs

- [ ] Relatório documentado no Notion
- [ ] Pronto para *apresentar ao cliente

---

## Tom e padrões de escrita

**Tom geral:** profissional mas acessível. O cliente NÃO é especialista em mídia — traduzir tudo para linguagem de negócio. O relatório é a vitrine do trabalho da squad.

**Sempre:**
- Traduzir siglas na primeira menção: "CPL (Custo por Lead)", "CPA (Custo por Aquisição)"
- Usar comparativos em R$ E %: "R$ 62,30 (queda de 9,5% vs. janeiro)" — nunca só um
- Incluir contexto de negócio em cada seção: "O que isso significa para a empresa"
- Terminar cada seção com 1 frase de interpretação em **negrito** conectando o dado ao resultado de negócio
- Manter cada seção em no máximo 1 "página visual" — ser conciso, não prolixo
- Citar números absolutos E relativos: "22 leads (↑ 37,5%)" — nunca só percentual

**Nunca:**
- Usar jargão sem tradução: CPC, CPM, ROAS, CTR, Frequency capping
- Apresentar números sem interpretação: "CTR foi 3,82%" sozinho não diz nada ao cliente
- Incluir mais de 2 parágrafos por seção — se precisa de mais, a estrutura está errada
- Inventar dados comparativos se não tiver período anterior — escrever "primeiro período de análise"
- Omitir canal sem dados — incluir com "Sem campanhas ativas no período" ao invés de não mencionar
- Esconder resultado ruim — apresentar com diagnóstico + plano de correção

---

## Comportamento do agente

**Se @nova não executou *analisar ou *leads para o período:**
→ PARAR. Não montar relatório sem dados de base. Informar: "Relatório depende de @nova/*analisar e @nova/*leads. Executar antes de prosseguir."

**Se o mês teve menos de 20 dias de campanha ativa:**
→ Alertar no Resumo Executivo: "⚠️ Resultados parciais — campanhas ativas por {n} de 30 dias."

**Se CPL do mês ficou acima da meta definida no plano de mídia:**
→ Dedicar 1 parágrafo explicativo no Resumo Executivo com diagnóstico e ação corretiva.

**Se algum canal não entregou resultados (0 conversões):**
→ Incluir na Seção 2 com explicação factual. Não omitir — o cliente vai perceber.

**Se um criativo concentra >70% das conversões:**
→ Flagar como risco de dependência na Seção 3 e recomendar diversificação.

---

## Exemplo Real

> Baseado no histórico real de análises OCP_ (Ocupacional).
> Use como referência de tom, profundidade e formato esperados.

---

# Relatório de Resultados — Ocupacional | Fevereiro/2026

## 1. Resumo Executivo

Em fevereiro investimos **R$ 5.420,00** em mídia paga (Meta Ads + Google Ads), gerando **87 leads** a um custo médio de **R$ 62,30 por lead**.

Comparado a janeiro:
- Investimento: R$ 5.420 vs R$ 4.890 (↑ 10,8%)
- Leads: 87 vs 71 (↑ 22,5%)
- CPL: R$ 62,30 vs R$ 68,87 (↓ 9,5% — mais eficiente)

**Para o negócio: estamos trazendo mais leads por real investido. A tendência é positiva mas depende de renovação de criativos — os atuais completam 45 dias em março, o que pode gerar fadiga.**

---

## 2. Performance por Canal

### Meta Ads
- Investimento: R$ 3.180,00 (59% do total)
- Leads: 51 (59% do total)
- CPL: R$ 62,35
- Destaque: Conjunto "interesses+site" com criativos estáticos entregou 34 leads a CPL R$ 41,20

**A Meta respondeu por quase 60% dos resultados. Os criativos estáticos (imagem direta + CTA) superaram vídeos de forma consistente durante todo o mês.**

### Google Ads
- Investimento: R$ 2.240,00 (41% do total)
- Leads: 36 (41% do total)
- CPL: R$ 62,22
- Destaque: PMax manteve eficiência concentrando 97% do budget em Search

**O Google manteve volume mas o CPA da Pesquisa subiu 23% no mês — concorrência crescente nos termos principais. Termos geolocalizados ("sst betim") mostraram CPA 10x menor.**

---

## 3. Criativos

**Campeões do mês:**
- Estático "Saúde Ocupacional + CTA WhatsApp" — 18 leads, CPL R$ 38,50
- Estático "eSocial urgência" — 12 leads, CPL R$ 44,20

**Em fadiga (frequência >3):**
- Vídeo institucional (45 dias rodando) — CPL subindo nas últimas 2 semanas

**Produzir para março:**
- 3 novos estáticos no formato campeão (imagem direta + CTA claro)
- 1 vídeo curto (<15s) com depoimento de cliente como teste

---

## 4. Próximos Passos

1. **Criativos:** Produzir 3 estáticos + 1 vídeo curto antes da 2ª semana de março
2. **Google:** Adicionar keywords geolocalizadas (sst betim, medicina do trabalho contagem) e restringir broad match em "medicina do trabalho"
3. **Budget:** Manter R$ 5.400 com redistribuição de 5% do Google Pesquisa para PMax
