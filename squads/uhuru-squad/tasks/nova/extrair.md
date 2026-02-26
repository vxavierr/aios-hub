# Task: Extrair Dados da Plataforma

**Agente:** @nova
**Comando:** `*extrair {cliente} {plataforma}`
**Frequência:** Diária (check de status) / Semanal (extração completa)

---

## Objetivo

Acessar as plataformas de anúncios e extrair dados de performance. Serve tanto para o check diário de status quanto para a extração semanal completa usada no Big Numbers.

---

## Inputs

- `{cliente}` — código do cliente (OCP_, ASM_, BDG_, PRODOM_)
- `{plataforma}` — meta | google | linkedin | all

---

## Execução

### Modo: Check de Status (uso diário)

**Meta Ads:**
1. Acessar Meta Ads Manager
2. Filtrar por conta do cliente
3. Verificar campanhas ativas: status, budget, impressões, cliques, leads hoje
4. Identificar anomalias: campanhas pausadas inesperadamente, custo por lead acima do normal

**Google Ads:**
1. Acessar Google Ads
2. Filtrar por conta do cliente
3. Verificar campanhas ativas: impressões, cliques, conversões
4. Checar Quality Score das principais campanhas

**LinkedIn (se aplicável):**
1. Acessar LinkedIn Campaign Manager
2. Verificar campanhas ativas: impressões, cliques, leads

**Output do check:**
```
✅ {cliente} | {plataforma} | {data}
Campanhas ativas: {n}
Leads hoje: {n} | CPL: R$ {valor}
Status: {OK / ALERTA}
{descrição do alerta se houver}
```

### Modo: Extração Semanal (Big Numbers)

1. Meta Ads: exportar relatório do período (semana/mês) por campanha
   - Métricas: impressões, cliques, CTR, CPM, leads, CPL, valor investido
2. Google Ads: exportar relatório equivalente
3. LinkedIn: exportar relatório equivalente
4. Consolidar tudo na planilha de análise no Google Sheets

---

## Outputs

- [ ] Check de status documentado (uso diário)
- [ ] Dados exportados e consolidados na planilha (uso semanal)
- [ ] Alertas identificados para @finn (budget) ou @nova/*analisar (diagnóstico)
