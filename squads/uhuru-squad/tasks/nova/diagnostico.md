# Task: Diagnóstico de Criativos

**Agente:** @nova
**Comando:** `*diagnostico {cliente}`
**Frequência:** Semanal

---

## Objetivo

Analisar os criativos em veiculação — identificar quais estão performando bem, quais estão em fadiga, e recomendar ações (incluindo quais posts devem ser impulsionados).

---

## Inputs

- `{cliente}` — código do cliente
- Dados de criativos do Meta Ads Manager e Google Ads

---

## Execução

### Passo 1 — Listar criativos ativos

No Meta Ads Manager:
- Acessar nível de anúncio
- Filtrar por campanha ativa
- Exportar lista de criativos com métricas: impressões, CTR, CPM, leads, frequência

No Google Ads — Diagnóstico expandido:

**RSA (Responsive Search Ads) — Search:**
- Verificar asset scores: "Aprendendo", "Bom", "Melhor desempenho"
- Identificar headlines e descriptions com score baixo por mais de 14 dias → substituir
- Verificar Ad Strength geral: "Excelente", "Bom", "Médio", "Ruim"

**Termos de busca (Search):**
- Exportar relatório de termos de busca do período
- Classificar:
  - 🟢 Termos que converteram com CPA abaixo da média → candidatos a keyword exata
  - 🔴 Termos que gastaram >R$ 50 sem converter → candidatos a negative keyword
  - 🔵 Termos novos com impressões mas sem cliques → avaliar relevância do anúncio
- Flagar termos geolocalizados (cidade + serviço) com CPA baixo como oportunidade
- Flagar concentração perigosa: se 1-2 termos respondem por 70%+ das conversões

**Assets de PMax:**
- Listar grupos de argumentos com performance do período
- Classificar por grupo:
  - 🟢 **Campeão** — CPA abaixo da média, volume consistente
  - 🟡 **Rotação normal** — variação de curto prazo, histórico bom (referenciar semanas anteriores)
  - 🔴 **Ineficiente** — CPA alto por 2+ semanas sem histórico bom
- Distribuição de canais: % em Search, Display, YouTube, Discovery
- Se Display/YouTube cortados pelo algoritmo → registrar como "budget limitado, comportamento esperado"
- Verificar assets de imagem/vídeo: quais têm "Melhor desempenho", quais estão "Baixo"

**Quality Score (Search):**
- Listar keywords com QS <= 5
- Para cada: CTR esperado vs real, relevância do anúncio, experiência da landing page
- Se QS caiu vs período anterior → flagar como alerta
- Keywords com QS 1-3 e gasto significativo → recomendar pausa ou reescrita de anúncio

**Extensões de anúncio:**
- Listar extensões ativas: sitelinks, callouts, structured snippets, call extensions
- Extensões com "Aprendendo" por mais de 14 dias → substituir
- Extensões sem impressões → remover
- Verificar se todos os tipos relevantes estão ativos (sitelinks + callouts no mínimo)

### Passo 2 — Classificar criativos

**Categorias:**
- 🟢 **Campeão** — CTR alto, CPL baixo, frequência ok → manter
- 🟡 **Fadiga** — Frequência >3, CTR caindo → considerar pausa
- 🔴 **Fraco** — CTR baixo, CPL alto → pausar
- 🔵 **Novo** — Menos de 3 dias rodando → aguardar

### Passo 3 — Recomendações de impulsionamento

Analisar posts orgânicos do cliente (se aplicável):
- Posts com bom engajamento orgânico são candidatos a boost
- Recomendar quais posts impulsionar com critério de performance esperada

### Passo 4 — Output

```
🎨 Diagnóstico de Criativos — {cliente}

CAMPEÕES (manter e escalar):
- {nome_criativo}: CTR {%}, CPL R${valor}, Frequência {n}

FADIGANDO (considerar renovação):
- {nome_criativo}: Frequência {n}, CTR caiu {%} vs. semana anterior

PAUSAR:
- {nome_criativo}: CPL R${valor} ({n}x acima da meta)

BOOST RECOMENDADO:
- Post "{título}": {n} engajamentos orgânicos, recomendar R$ {budget} por {n} dias

💡 Ação imediata: {lista de ações concretas}
```

---

## Exemplo Real

> Diagnóstico de criativos OCP_ (Ocupacional) — Semana 10-16/02/2026.

---

```
🎨 Diagnóstico de Criativos — OCP_ | Semana 10-16/02/2026

━━━ META ADS ━━━

CAMPEÕES (manter e escalar):
- Estático "Saúde Ocupacional + CTA WhatsApp": CTR 4,8%, CPL R$ 38,50, Frequência 1,9 — melhor criativo do mês
- Estático "eSocial urgência": CTR 3,6%, CPL R$ 44,20, Frequência 2,1

FADIGANDO (considerar renovação):
- Vídeo institucional (45 dias rodando): Frequência 3,8 (↑ vs 2,9 semana anterior), CTR caiu de 2,1% para 1,4% (-33%)
  → Recomendar pausa e briefing de vídeo curto (<15s) com depoimento de cliente

PAUSAR:
- Carrossel "Serviços completos": CPL R$ 128,00 (2x acima da meta), CTR 0,9%, 0 leads na semana
  → Pausar imediatamente

BOOST RECOMENDADO:
- Post orgânico "Dicas de SST para indústrias" (12/02): 340 curtidas, 47 compartilhamentos → R$ 50 por 5 dias, público semelhante ao conjunto campeão

━━━ GOOGLE ADS ━━━

SEARCH — TERMOS DE BUSCA:
🟢 Oportunidades (converter como KW exata):
- "sst betim": 2 conversões, CPA R$ 5,03 — melhor CPA da campanha
- "medicina do trabalho contagem": 1 conversão, CPA R$ 12,40

🔴 Negativas recomendadas:
- "medicina do trabalho salário": R$ 67 gastos, 0 conversões — busca informacional
- "curso segurança do trabalho": R$ 43 gastos, 0 conversões — público estudante

RSA — ASSETS:
- Ad Strength: Bom
- Headline "Saúde Ocupacional em BH" — Melhor desempenho
- Headline "Medicina do Trabalho Barata" — Baixo (14+ dias) → substituir por "PCMSO e PGR para sua Empresa"

PMAX — GRUPOS DE ARGUMENTOS:
- 🟢 Grupo "Comercial Geral": 8 conversões, CPA R$ 42,30 (campeão)
- 🟡 Grupo "Institucional": CPA R$ 78,20 (rotação normal — semana anterior: R$ 51,00, média 8 semanas: R$ 58,00)

Distribuição: Search 97% | Display 2% | YouTube 1% | Discovery 0%
→ Budget limitado — algoritmo priorizou Search. Comportamento esperado, não intervir.

QUALITY SCORE — ALERTAS:
- "medicina do trabalho" (broad): QS 5 → CTR esperado "abaixo da média", relevância "média"
  → QS caiu de 7 para 5 em 2 semanas. Saturação do leilão.

EXTENSÕES:
- Sitelinks: 4 ativos ✅
- Callouts: 3 ativos ✅
- Structured snippets: sem impressões há 14 dias → remover e recriar

━━━ AÇÕES IMEDIATAS ━━━

1. Pausar carrossel Meta "Serviços completos" — Prioridade: 🔴
2. Adicionar "sst betim" como KW exata no Google Search — Prioridade: 🔴
3. Substituir headline "Medicina do Trabalho Barata" no RSA — Prioridade: 🟠
4. Impulsionar post orgânico "Dicas de SST" com R$ 50/5 dias — Prioridade: 🟢
5. Briefar novo vídeo curto para substituir institucional fadigado → @flux/*briefing — Prioridade: 🟢
```

---

## Outputs

- [ ] Mapa de criativos classificados (Meta + Google)
- [ ] Lista de criativos/assets para pausar
- [ ] Posts para impulsionar com budget sugerido
- [ ] Termos de busca: oportunidades + negativas recomendadas
- [ ] Assets PMax classificados por grupo
- [ ] Keywords com QS baixo flagadas
- [ ] Briefing de novos criativos necessários → @flux/*briefing

---

## Tom e padrões de escrita

**Tom geral:** direto, orientado a ação. Cada diagnóstico DEVE resultar em ação concreta — se não tem ação, é observação e fica de fora.

**Sempre:**
- Separar diagnóstico Meta e diagnóstico Google em seções distintas
- Nomear criativos, keywords, termos e assets específicos com métricas individuais
- Comparar com período anterior quando disponível: "CTR caiu de 4,2% para 2,8% (-33%)"
- Contextualizar PMax com histórico: "na semana X esse grupo entregou Y conversões a Z"
- Classificar ANTES de recomendar — diagnóstico primeiro, ação depois

**Nunca:**
- Inventar métricas que não estão nos dados
- Dizer que PMax "variou muito" sem contextualizar com histórico
- Recomendar pausa de grupo PMax com base em 1 semana ruim se o histórico é bom
- Misturar diagnóstico com otimizações de bid (otimizações ficam em @finn/*otimizar)

---

## Comportamento do agente

**Se o cliente só tem Meta (sem Google):**
→ Pular toda a seção Google. Não criar seção vazia.

**Se não tiver dados do período anterior para comparar:**
→ Apresentar métricas absolutas e dizer "sem comparativo disponível". Não inventar tendência.

**Se um criativo está rodando há menos de 3 dias:**
→ Classificar como 🔵 Novo e não tirar conclusões. "Aguardando aprendizado do algoritmo."

**Se todas as métricas estiverem saudáveis:**
→ Dizer explicitamente: "Criativos em boa saúde — sem ações urgentes." Não forçar recomendações.

---

## Template de Output expandido

```
🎨 Diagnóstico de Criativos — {cliente} | {período}

━━━ META ADS ━━━

CAMPEÕES (manter e escalar):
- {nome_criativo}: CTR {%}, CPL R${valor}, Frequência {n}

FADIGANDO (considerar renovação):
- {nome_criativo}: Frequência {n}, CTR caiu {%} vs. anterior

PAUSAR:
- {nome_criativo}: CPL R${valor} ({n}x acima da meta)

BOOST RECOMENDADO:
- Post "{título}": {n} engajamentos orgânicos → R$ {budget} por {n} dias

━━━ GOOGLE ADS ━━━

SEARCH — TERMOS DE BUSCA:
🟢 Oportunidades (converter como KW exata):
- "{termo}": {n} conversões, CPA R$ {valor}

🔴 Negativas recomendadas:
- "{termo}": R$ {gasto} sem conversão

RSA — ASSETS:
- Ad Strength: {Excelente/Bom/Médio/Ruim}
- Assets com score baixo (>14 dias): {lista}

PMAX — GRUPOS DE ARGUMENTOS:
- 🟢 {grupo}: {n} conversões, CPA R$ {valor} (campeão)
- 🟡 {grupo}: CPA R$ {valor} (rotação normal — histórico: R$ {valor} na semana X)
- 🔴 {grupo}: CPA R$ {valor} por 2+ semanas (ineficiente)

Distribuição: Search {%} | Display {%} | YouTube {%} | Discovery {%}

QUALITY SCORE — ALERTAS:
- "{keyword}": QS {n} → {CTR esperado/real, relevância, landing page}

EXTENSÕES:
- {tipo}: {status — ativo/aprendendo/sem impressões}

━━━ AÇÕES IMEDIATAS ━━━

1. {ação} — Prioridade: 🔴/🟠/🟢
2. {ação}
3. {ação}
```
