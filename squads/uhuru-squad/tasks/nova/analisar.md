# Task: Análise de Campanhas (Big Numbers)

**Agente:** @nova
**Comando:** `*analisar {cliente} {período}`
**Frequência:** Semanal, após *normalizar

---

## Objetivo

Analisar os dados normalizados de campanhas do período e entregar dois blocos distintos:
1. **Análise completa** — Big Numbers + diagnóstico por campanha/subcampanha
2. **Otimizações propostas** — bloco separado, nunca misturado na análise

---

## Inputs

- Dataset normalizado (output de *normalizar)
- `{cliente}` — código do cliente
- `{período}` — semana ou período analisado (ex: "10/02 a 16/02")

**Se dados estiverem incompletos, ambíguos ou faltando contexto comparativo → PERGUNTAR antes de analisar.**

Perguntas válidas para fazer ao usuário antes de continuar:
- "Qual era o investimento/conversões da semana anterior? Preciso para calcular variações."
- "O budget diário mudou nesse período?"
- "Houve pausas de campanha ou alterações manuais nessa semana?"

---

## Estrutura da Análise

### BLOCO 1 — ANÁLISE

---

#### Cabeçalho

```
📊 ANÁLISE DE CAMPANHAS — {cliente} | {data do relatório}
📅 Período analisado: {data_inicio} a {data_fim}
```

---

#### Big Numbers por plataforma e campanha

Para cada plataforma ativa (Google Ads, Meta Ads, LinkedIn), estruturar:

```
## {Plataforma} — {Nome da Campanha}

💰 Investimento: R$ {valor} {indicador}
👤 Conversões: {n} {indicador}
💵 CPA: R$ {valor} {indicador}
```

**Indicadores de tendência** (comparação com período anterior):
- 🟢 Melhora (CPA caiu, conversões subiram, eficiência melhorou)
- 🟠 Ponto de atenção (variação moderada negativa)
- 🔴 Urgência (queda expressiva ou custo fora do target)
- ➡️ Estável (variação < 5%)
- **—** Sem período anterior disponível para comparar (não inventar variação)

---

#### Análise por subcampanha

**Google Ads — estrutura:**

```
### Pesquisa

- {volume de conversões, custo total, CPA — comparação com semana anterior em %}
- {keywords principais que converteram: nome da KW, n° de conversões, CPA individual}
- {keywords que drenaram budget sem converter}
- **{insight em negrito: diagnóstico de causa-raiz do que explica a variação}**
- **{identificar oportunidades específicas nos termos de busca reais, se disponível}**

---

### Performance Max (PMax)

- {volume de conversões, custo total, CPA — comparação com semana anterior em %}
- {grupos de argumentos: qual performou melhor/pior, n° de conversões e CPA por grupo}
- {comportamento do algoritmo quando relevante — ex: concentração em Search, corte de Display}
- **{referência a histórico quando disponível: "na semana X esse grupo entregou Y"}**
- **{interpretação do padrão — rotação entre grupos é normal, variação esperada do algoritmo}**
```

**Meta Ads — estrutura:**

```
### {Nome do Conjunto / Grupo de Anúncios}

- {volume, custo, CPA — comparação com período anterior em %}
- {performance por anúncio: estático vs vídeo, criativos específicos com n° de conversões e CPL}
- {qual criativo concentra conversões, qual está com performance abaixo}
- **{insight em negrito: o que explica a diferença entre criativos}**
```

---

#### Seção de Leads (quando aplicável)

```
### Geral Leads

💰 Investimento: R$ {valor} {indicador}
👤 Leads únicos: {n} {indicador}
💵 CPL: R$ {valor} {indicador}

- {observação sobre volume e eficiência, comparação com período anterior}
```

---

### Tom e padrões de escrita

**Tom geral:** direto, sem rodeios, orientado a diagnóstico. Não é relatório formal — é análise de negócio. Linguagem pode ser coloquial quando o diagnóstico pede urgência: "A campanha tá perdendo eficiência rápido" é melhor que "observou-se queda na performance".

**Sempre:**
- Comparar com período anterior em % quando os dados estiverem disponíveis
  - Formato: "queda de 45% no volume (6 vs 11 conversões na semana anterior)"
  - Mostrar ambos os valores absolutos + percentual: nunca só um
- Destacar em **negrito** os insights mais importantes e diagnósticos de causa-raiz
- Nomear explicitamente: keywords, grupos de argumentos, criativos específicos com seus números individuais
- Separar fato de interpretação na mesma frase:
  - Fato: "CPA subiu 71% de R$ 28 para R$ 48"
  - Interpretação: "**o que indica saturação do termo principal e pressão crescente no leilão**"
- Referenciar histórico quando relevante para contextualizar PMax: "na semana de 04-10/08 esse grupo entregou 34 conversões a R$ 14,44"
- Mencionar status de budget quando for limitante: "orçamento limitado (status 'Qualificado limitado')"
- Quando identificar oportunidade em termo de busca novo (CPA baixo, não está como KW ativa) → nomear o termo e o número exato

**Pesquisa — padrões específicos:**
- Sempre analisar **keywords** E os **termos de busca reais** que geraram conversão (são coisas diferentes)
- Flagar concentração de risco: se 1-2 keywords respondem por 70%+ das conversões → "**concentração perigosa em X**"
- Flagar termos geolocalizados convertendo a CPA baixo como oportunidade de adicionar como KW exata
- Flagar quando CTR sobe mas CPC também sobe → sinal de pressão de leilão, não de qualidade

**PMax — padrões específicos:**
- Rotação entre grupos de argumentos **é normal** — contextualizar sempre com histórico de semanas anteriores
- Corte de canais como Display/YouTube pelo algoritmo quando budget é limitado → explicar como comportamento esperado, não problema
- Search concentrando 90%+ do investimento é normal quando orçamento está apertado
- Grupo com CPA alto mas histórico bom → não é vilão, é variação de curto prazo

**Meta — padrões específicos:**
- Sempre quebrar performance por criativo individual: estático 1, estático 2, vídeo 1, vídeo 2 com CPL individual
- Quando um criativo concentra 70%+ das conversões → flagar como dependência
- Quando vídeo começa a converter pela primeira vez → registrar explicitamente: "os vídeos começaram a gerar conversões pela primeira vez"
- Volatilidade de volume sem mudança de configuração → atribuir a dinâmica de leilão, não a problema da campanha

**Nunca:**
- Inventar variações percentuais sem ter o período anterior disponível — se não tiver, dizer que não tem
- Criar dados que não estão no CSV
- Misturar recomendações com a análise (ficam no Bloco 2)
- Usar linguagem vaga sem números: "performance boa", "resultado razoável", "levemente abaixo"
- Dizer que PMax "variou muito" sem contextualizar com o histórico de semanas anteriores
- Omitir status de budget quando ele é fator limitante da performance

---

### BLOCO 2 — OTIMIZAÇÕES PROPOSTAS

*Sempre separado da análise. Nunca misturar no Bloco 1.*

```
---
💡 OTIMIZAÇÕES PROPOSTAS — {cliente} | {período}
---

**{N}. {Título da otimização}**
- **Problema identificado:** {o que os dados mostram, com número}
- **Ação sugerida:** {o que fazer — específico e executável}
- **Impacto esperado:** {resultado provável se a ação for executada}
- **Prioridade:** 🔴 Alta | 🟠 Média | 🟢 Baixa
```

**Quando sugerir otimizações:**
- CPA acima do target por 2+ semanas → revisão de lances ou segmentação
- Uma keyword ou criativo concentrando 70%+ das conversões → diversificação
- Budget limitado travando performance → redistribuição ou aumento
- Novo termo de busca com CPA muito abaixo da média → adicionar como KW exata
- Grupo com investimento sem conversão por 2+ semanas → pausar
- CTR caindo com CPC subindo → saturação de público ou criativo desgastado
- Oportunidade geolocalizada identificada nos termos de busca → expandir

---

## Comportamento do agente

**Se faltar dado crítico:**
→ Perguntar explicitamente antes de continuar. Exemplo:
> "Para calcular a variação de CPA preciso do valor da semana anterior. Você tem esse dado ou quer que eu analise só o período atual sem comparativo?"

**Se houver poucas conversões (< 5 no período):**
→ Alertar que a análise tem limitações estatísticas. Não extrair tendências de amostras pequenas.

**Se a campanha estiver pausada ou sem entrega:**
→ Registrar o fato objetivamente, não especular sobre causas sem evidência nos dados.

---

## Output

```
📊 ANÁLISE DE CAMPANHAS — {cliente} | {data}
📅 Período: {data_inicio} a {data_fim}

[BLOCO 1 — ANÁLISE POR PLATAFORMA/CAMPANHA]

---

💡 OTIMIZAÇÕES PROPOSTAS

[BLOCO 2 — OTIMIZAÇÕES]
```

- [ ] Big Numbers por plataforma com indicadores de tendência
- [ ] Análise por subcampanha com diagnóstico de causa-raiz
- [ ] Comparativos percentuais com período anterior (quando disponível)
- [ ] Seção de leads incluída quando aplicável
- [ ] Bloco de otimizações separado e acionável
- [ ] Nenhum dado inventado — apenas o que consta no dataset normalizado

---

## Exemplo Real

> Extraído do histórico real de análises OCP_ (semana 10/11 a 16/11/2025).
> Use este exemplo como referência de nível de detalhe, tom e estrutura esperados.

---

📊 ANÁLISE DE CAMPANHAS — OCP_ | 18/11/2025
📅 Período analisado: 10/11 a 16/11

---

## Google Ads — Campanha Comercial

💰 Investimento: R$ 496,91 🟠
👤 Conversões: 17 🟠
💵 CPA: R$ 29,23 🟠

### Pesquisa

- A campanha trouxe 6 conversões gastando R$ 290,73 (-6,69%), queda de 45,45% no volume comparado com a semana passada (11 conversões com R$ 311,57). O CPA subiu 71,07% pra R$ 48,45 (antes era R$ 28,32). Impressões caíram 18,47% (640 vs. 785), cliques diminuíram 19% (81 vs. 100). CTR ficou praticamente igual em 12,66% (-0,65 p.p.), mas CPC médio aumentou 15,20% pra R$ 3,59.
- **A queda na performance indica que as palavras-chave que vinham funcionando melhor estão saturadas e a concorrência no leilão está mais acirrada.** "Medicina do trabalho" (broad match) perdeu 60% do volume (2 vs. 5 conversões), CPA subiu 52,87% pra R$ 50,36. Já "ocupacional medicina do trabalho" (frase exata) manteve 3 conversões mas CPA caiu 37,64% pra R$ 13,86 — termos mais específicos estão indo melhor. **O CPC subindo (+15,20%) sem o CTR subir junto mostra que tem mais pressão no leilão, provavelmente de concorrentes locais aumentando lances em termos genéricos.**
- **Concentração perigosa:** "medicina do trabalho" e "ocupacional medicina do trabalho" respondem por 83% das conversões (5 de 6). A campanha tá com status "Qualificado limitado" por orçamento, o que pode estar travando o alcance justamente nos termos que funcionam melhor.
- **Oportunidade identificada nos termos de busca:** "sst betim" gerou 2 conversões com CPA de R$ 5,03 (o melhor da campanha), mas não existe como palavra-chave ativa — tá entrando via broad match de outras KWs. Outros 23 termos com impressões no período não geraram nenhum clique, sinalizando desalinhamento entre intenção de busca e anúncio.
- **A campanha tá perdendo eficiência rápido.** Volume de conversões caiu 45% mas CPA subiu 71% — impacto negativo duplo. O termo "sst betim" (geolocalizado + específico) com CPA de R$ 5,03 mostra o caminho: expandir pra termos híbridos localização+serviço pode recuperar volume com eficiência.

---

### Performance Max (PMax)

- A campanha trouxe 11 conversões gastando R$ 206,19 (-8,99%), aumento de 22,22% no volume comparado com a semana passada (9 conversões com R$ 226,56). CPA caiu 25,54% pra R$ 18,74 (antes era R$ 25,17). Impressões caíram 52,00% (1.260 vs. 2.625), cliques diminuíram 52,90% (65 vs. 138). Taxa de conversão subiu 155,56% pra 16,67% (antes era 6,52%), mas CPC médio subiu 93,21% pra R$ 3,17.
- **A melhoria na eficiência (CPA -25,54%, taxa de conversão +155,56%) com queda de volume é normal pra essa PMax rodando com orçamento limitado.** Olhando o histórico: semana 04-10/08 teve 34 conversões a R$ 14,44; semana 11-17/08 caiu pra 13 a R$ 32,54; semana 01-07/09 voltou pra 19 a R$ 25,20. **Essa variação é típica do algoritmo ajustando lances e canais por conta da limitação de budget.** O CPC subindo 93,21% não é ineficiência — é o Google priorizando leilões com mais chance de conversão, abrindo mão de volume.
- Distribuição de canais: Search concentra 97,76% do investimento (R$ 201,52 de R$ 206,19) e 100% das conversões. Display (R$ 4,51) e YouTube (R$ 0,15) foram praticamente cortados pelo algoritmo. **No passado, Discovery funcionava como awareness (semana 03-09/11: 1.486 impressões, 87 cliques, 0 conversões). Agora com budget reduzido, o algoritmo cortou completamente os canais de topo de funil — comportamento esperado.**
- Por grupos de argumentos: "prevencao-de-riscos" e "urgencia-legal" concentraram 81% das conversões (9 de 11). **Essa rotação entre grupos é padrão da PMax — o algoritmo testa, aprende e redistribui conforme resposta do público.** Histórico confirma: semana 04-10/08 foi 100% "prevencao-de-riscos" (34/34); semana 08-14/09 "esocial" dominou com 14 conversões; semana 03-09/11 equilibrou entre os três grupos. O grupo "esocial" com CPA de R$ 53,29 nesta semana não é vilão estrutural — na semana 08-14/09 entregou R$ 24,36.

### Geral Leads

💰 Investimento: R$ 538,13 🟠
👤 Leads únicos: 15 🟢
💵 CPL: R$ 35,87 🟢

- Volume cresceu em relação à semana anterior (15 vs. 11 leads). CPL caiu proporcionalmente — melhora de eficiência na geração de leads mesmo com queda nas conversões de formulário de contato.

---

💡 OTIMIZAÇÕES PROPOSTAS — OCP_ | 10/11 a 16/11

---

**1. Adicionar "sst betim" como palavra-chave exata**
- **Problema identificado:** Termo gerou 2 conversões com CPA de R$ 5,03 (melhor da campanha) mas não existe como KW ativa — risco de perder por mudança de correspondência.
- **Ação sugerida:** Adicionar "sst betim" como correspondência exata imediatamente. Expandir variações: "medicina do trabalho betim", "sst contagem", "ocupacional belo horizonte".
- **Impacto esperado:** Capturar volume qualificado com CPA 10x abaixo da média atual.
- **Prioridade:** 🔴 Alta

**2. Revisar correspondência ampla de "medicina do trabalho"**
- **Problema identificado:** KW broad match perdeu 60% do volume e tem CPA 3x maior que a versão frase exata. Está gerando pressão de leilão sem retorno proporcional.
- **Ação sugerida:** Reduzir lance ou mudar para correspondência de frase. Monitorar quais termos de busca estão sendo ativados.
- **Impacto esperado:** Redução de CPA médio da Pesquisa, liberando budget para termos que convertem.
- **Prioridade:** 🟠 Média

**3. Aumentar budget da PMax para desbloquear canais de awareness**
- **Problema identificado:** Algoritmo cortou Display e Discovery por limitação de orçamento. Campanha está funcionando só como Pesquisa, perdendo alcance de topo de funil.
- **Ação sugerida:** Aumentar budget diário de R$ 35 para R$ 50-60 e monitorar por 2 semanas.
- **Impacto esperado:** Retomada de entrega em Discovery (que historicamente gera awareness) sem comprometer eficiência de Search.
- **Prioridade:** 🟠 Média
