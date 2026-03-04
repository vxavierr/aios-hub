# Task: Normalizar Dados de Campanhas

**Agente:** @nova
**Comando:** `*normalizar {cliente} {plataforma} [arquivo.csv]`
**Frequência:** A cada ciclo semanal, antes de *analisar

---

## Objetivo

Receber o CSV bruto exportado diretamente de uma plataforma de anúncios (Meta Ads, Google Ads ou LinkedIn) e produzir um dataset limpo, padronizado e pronto para análise. Sem normalização, *analisar não consegue funcionar de forma consistente entre plataformas.

---

## Inputs

- `{cliente}` — código do cliente (OCP_, ASM_, BDG_, PRODOM_)
- `{plataforma}` — meta | google | linkedin | all
- `[arquivo.csv]` — arquivo exportado diretamente da plataforma (fornecido pelo usuário)

**Se o arquivo não for fornecido → PERGUNTAR antes de continuar.**

---

## Passo 1 — Identificar plataforma e estrutura

Verificar quais colunas estão presentes no CSV para identificar a plataforma de origem:

| Indicador no CSV | Plataforma |
|-----------------|-----------|
| "Valor usado", "Resultados", "Conjunto de anúncios" | Meta Ads |
| "Campanha", "Grupo de anúncios", "Custo por conversão" | Google Ads |
| "Campaign Name", "Total Spent", "Cost per Lead" | LinkedIn |

Se não conseguir identificar a plataforma com segurança → **PERGUNTAR ao usuário.**

---

## Passo 2 — Mapeamento de colunas por plataforma

### Meta Ads → Schema padrão

| Coluna original (Meta) | Campo padrão |
|------------------------|-------------|
| Nome da campanha | campanha |
| Nome do conjunto de anúncios | conjunto |
| Nome do anúncio | anuncio |
| Início do relatório | data_inicio |
| Término do relatório | data_fim |
| Impressões | impressoes |
| Cliques no link | cliques |
| CTR (taxa de cliques no link) | ctr |
| CPM (custo por 1.000 impressões) | cpm |
| CPC (custo por clique no link) | cpc |
| Valor usado (BRL) | investimento |
| Resultados | conversoes |
| Custo por resultado | cpa |
| Alcance | alcance |
| Frequência | frequencia |

### Google Ads → Schema padrão

| Coluna original (Google) | Campo padrão |
|--------------------------|-------------|
| Campanha | campanha |
| Grupo de anúncios | conjunto |
| Anúncio | anuncio |
| Período | data_inicio / data_fim |
| Impressões | impressoes |
| Cliques | cliques |
| CTR | ctr |
| CPC médio | cpc |
| Custo | investimento |
| Conversões | conversoes |
| Custo por conversão | cpa |
| Taxa de conversão | taxa_conversao |

### LinkedIn → Schema padrão

| Coluna original (LinkedIn) | Campo padrão |
|---------------------------|-------------|
| Campaign Name | campanha |
| Ad Group | conjunto |
| Ad Name | anuncio |
| Start Date | data_inicio |
| End Date | data_fim |
| Impressions | impressoes |
| Clicks | cliques |
| CTR | ctr |
| Avg. CPC | cpc |
| Total Spent | investimento |
| Leads | conversoes |
| Cost per Lead | cpa |

---

## Passo 3 — Limpeza e padronização

Aplicar as seguintes transformações:

**Datas:**
- Padronizar para formato `DD/MM/YYYY`
- Se o CSV tiver período único (ex: "01/02/2026 – 28/02/2026"), separar em `data_inicio` e `data_fim`

**Valores monetários:**
- Remover "R$", "BRL", vírgulas e espaços → converter para número decimal
- Exemplo: `"R$ 1.234,56"` → `1234.56`

**Percentuais:**
- Remover "%" → converter para decimal
- Exemplo: `"2,34%"` → `2.34`

**Valores ausentes:**
- Células vazias ou "-" → substituir por `0` em métricas numéricas
- Manter vazio em campos textuais (campanha, conjunto, anúncio)

**Linhas de total/subtotal:**
- Remover linhas de totais automáticos do export (geralmente a última linha com "Total")

**Colunas irrelevantes:**
- Descartar colunas que não constam no schema padrão acima

---

## Passo 4 — Validação básica

Antes de entregar, verificar:

- [ ] Todas as colunas do schema padrão estão presentes (ou justificadas como ausentes)
- [ ] Nenhuma métrica principal (impressoes, cliques, investimento, conversoes) está toda zerada
- [ ] Pelo menos uma campanha ativa no período
- [ ] Datas fazem sentido (data_fim >= data_inicio)

**Se alguma validação falhar → alertar o usuário antes de prosseguir.**

---

## Output

Entregar o dataset normalizado no seguinte formato markdown:

```
📋 DADOS NORMALIZADOS — {cliente} | {plataforma} | {período}

Schema: campanha | conjunto | anuncio | data_inicio | data_fim | impressoes | cliques | ctr | cpm | cpc | investimento | conversoes | cpa

Linhas processadas: {n}
Período coberto: {data_inicio} a {data_fim}
Campanhas identificadas: {lista}
Alertas: {nenhum | descrição de anomalias}

[TABELA DE DADOS NORMALIZADOS]
```

- [ ] Dataset normalizado entregue
- [ ] Alertas de qualidade identificados (se houver)
- [ ] Pronto para *analisar
