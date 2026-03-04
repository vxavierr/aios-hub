# Task: Dashboard Executivo (Big Numbers)

**Agente:** @sage
**Comando:** `*dashboard {cliente}`
**Frequência:** Semanal / Sob demanda

---

## Objetivo

Criar ou atualizar o dashboard executivo do cliente — versão resumida e visual dos Big Numbers para consumo rápido pelo cliente ou pelo time de gestão.

---

## Inputs

- `{cliente}` — código do cliente
- Big Numbers compilados (@nova/*analisar)

---

## Execução

### Passo 1 — Confirmar dados do período

Verificar análise de @nova para o período atual.

### Passo 2 — Montar Big Numbers

Formato do dashboard:

```
📊 {CLIENTE} — Big Numbers | {período}

💰 INVESTIMENTO
Total: R$ {valor}
Meta Ads: R$ {valor} | Google Ads: R$ {valor}

🎯 RESULTADOS
Leads totais: {n} ({delta}% vs. anterior)
CPL médio: R$ {valor} ({delta}%)
Melhor canal: {canal} (CPL R$ {valor})

📈 EFICIÊNCIA
CTR médio: {%}
Taxa de conversão (clique→lead): {%}

⭐ DESTAQUES
- {destaque 1}
- {destaque 2}

⚠️ ALERTAS
- {alerta 1}
```

### Passo 3 — Publicar no Notion

Atualizar a página de Big Numbers do cliente no Notion.

---

## Outputs

- [ ] Big Numbers atualizado no Notion
- [ ] Pronto para compartilhar com cliente

---

## Tom e padrões de escrita

**Tom geral:** executivo, visual, orientado a decisão. Menos texto, mais números. O dashboard é para olhar em 10 segundos e entender o status.

**Sempre:**
- Usar indicadores visuais de tendência: ↑ (subiu), ↓ (desceu), → (estável)
- Comparar SEMPRE com período anterior em delta absoluto + percentual: "R$ 62,30 (↓ 9,5% vs. anterior)"
- Mostrar ambos os valores (atual e anterior) para contexto
- Destacar o melhor canal com justificativa em 1 linha
- Limitar alertas a no máximo 3 — priorizar os mais urgentes
- Usar emojis dos indicadores de forma consistente: 💰 investimento, 🎯 resultados, 📈 eficiência, ⭐ destaques, ⚠️ alertas

**Nunca:**
- Usar siglas sem tradução (CTR = Taxa de cliques, CPM = Custo por mil impressões)
- Apresentar dado sem fonte — todo número vem de @nova/*analisar
- Inventar tendência ou comparativo se não tiver período anterior disponível — dizer "sem comparativo disponível"
- Incluir mais de 2 destaques e 2 alertas — ser cirúrgico
- Usar linguagem técnica de mídia sem contexto — o cliente pode ver este dashboard

---

## Comportamento do agente

**Se faltar dado do período anterior:**
→ Apresentar apenas o atual. Escrever "— (primeiro período)" no campo de variação. Não inventar comparativo.

**Se alguma plataforma não tiver dados no período:**
→ Registrar explicitamente: "Google Ads: Sem dados no período (campanhas pausadas)". Não omitir a plataforma.

**Se todas as métricas estiverem estáveis (variação < 5%):**
→ Dizer explicitamente "→ Período estável" ao invés de forçar narrativa de crescimento/queda.

**Se o investimento real estiver >15% acima ou abaixo do planejado:**
→ Incluir como alerta obrigatório com o desvio em R$ e %.

**Se @nova/*analisar não foi executado para o período:**
→ PARAR. Informar: "Dashboard depende da análise de @nova. Execute `*analisar {cliente} {período}` antes."

---

## Exemplo Real

> Extraído do histórico real de análises OCP_ (Ocupacional).
> Use como referência de nível de detalhe, formato e tom esperados.

---

📊 OCP_ — Big Numbers | Semana 10/02 a 16/02

💰 INVESTIMENTO
Total: R$ 1.247,35 (↓ 7,8% vs. anterior)
Meta Ads: R$ 709,22 | Google Ads: R$ 538,13

🎯 RESULTADOS
Leads totais: 22 (↑ 37,5% vs. 16 na semana anterior)
CPL médio: R$ 56,70 (↓ 12,3%)
Melhor canal: Meta Feed (CPL R$ 41,20 — 27% abaixo da média geral)

📈 EFICIÊNCIA
CTR médio: 3,82%
Taxa de conversão (clique→lead): 4,1%

⭐ DESTAQUES
- Meta Feed entregou 14 dos 22 leads (64%) com CPL 27% menor que a média
- PMax Google concentrou 97% do investimento em Search — priorizou conversão sobre awareness

⚠️ ALERTAS
- CPA Google Pesquisa subiu 71% (R$ 48,45 vs R$ 28,32) — saturação nos termos principais
- Keyword "medicina do trabalho" (broad) perdeu 60% do volume — considerar restringir correspondência
