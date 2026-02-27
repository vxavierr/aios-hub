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
