# Task: Apresentação para Cliente

**Agente:** @sage
**Comando:** `*apresentar {cliente}`
**Frequência:** Mensal

---

## Objetivo

Preparar e estruturar a apresentação de resultados para a reunião mensal com o cliente — tornando os dados acessíveis e a reunião produtiva.

---

## Inputs

- `{cliente}` — código do cliente
- Relatório do mês (@sage/*relatorio)
- Insights do período (@sage/*insights)

---

## Execução

### Estrutura da apresentação

**Slide 1 — Abertura**
- Logo do cliente
- Período de referência
- "Resultados de {mês}"

**Slide 2 — Resumo Executivo**
- Os 3 números mais importantes do mês
- Um destaque e um ponto de atenção

**Slide 3 — Performance por Canal**
- Gráfico ou tabela simples: canal | investido | leads | CPL
- Comparativo vs. mês anterior com setas (↑↓)

**Slide 4 — Criativos em Destaque**
- Print ou referência dos top 3 criativos
- Por que performaram bem

**Slide 5 — Insights e Aprendizados**
- 3 aprendizados do mês
- Em linguagem de negócio, não técnica

**Slide 6 — Próximos Passos**
- O que vamos fazer no próximo mês
- Testes planejados
- Budget e metas do próximo ciclo

**Slide 7 — Próxima Reunião**
- Data sugerida
- O que esperamos apresentar

### Passo 2 — Preparar para reunião

Verificar:
- [ ] Números estão corretos
- [ ] Linguagem está adequada para o cliente (não técnica)
- [ ] Próximos passos estão alinhados com @flux/*planejar

---

## Outputs

- [ ] Apresentação criada no **Google Slides** (ferramenta padrão da squad)
- [ ] Enviada ao cliente antes da reunião (link do Google Slides com permissão de visualização)
- [ ] Reunião agendada

> **Ferramenta padrão:** Google Slides. Usar Notion apenas como backup se o cliente preferir explicitamente. Google Slides permite melhor controle visual, compartilhamento por link, e apresentação em tela cheia durante a reunião.

---

## Tom e padrões de escrita

**Tom geral:** visual, direto, zero jargão. O cliente quer saber 4 coisas: "Gastou quanto? Trouxe quantos leads? Tá bom ou ruim? O que vamos fazer?"

**Regra dos 3:** máximo 3 números por slide, máximo 3 bullets por tópico, máximo 3 próximos passos. Se tem mais, priorizar.

**Sempre:**
- Abrir com o resultado mais impactante do mês (bom ou ruim — não esconder)
- Usar setas visuais e cores: ↑ verde (bom), ↓ vermelho (atenção), → azul (estável)
- Comparar SEMPRE com mês anterior — o cliente precisa de referência
- Fechar com próximos passos concretos e datas: "Na 2ª semana de março vamos..." (não "em breve")
- Incluir 1 slide respondendo algo que o cliente pediu na reunião anterior (se houver)
- Tempo máximo da apresentação: 20-30 minutos — planejar para isso

**Nunca:**
- Mostrar tabela com mais de 5 linhas — resumir ou usar gráfico de barras simples
- Usar gráficos complexos (pizza com 8 fatias, linhas com 6 séries) — barra simples ou número grande
- Falar em CTR, CPM, CPC, ROAS sem traduzir: "Taxa de cliques (CTR)" na primeira menção
- Apresentar problema sem solução proposta — todo ponto de atenção tem uma ação associada
- Ler os slides durante a apresentação — os slides são visuais, a narrativa é oral
- Ultrapassar 7 slides — se precisa de mais, a informação não está bem destilada

---

## Comportamento do agente

**Se o relatório (@sage/*relatorio) não está pronto:**
→ PARAR. A apresentação é derivada do relatório. Solicitar execução antes de prosseguir.

**Se o mês teve resultado ruim (CPL acima da meta ou leads abaixo do esperado):**
→ Não esconder. Apresentar no Slide 2 com diagnóstico claro + plano de correção no Slide 6. O cliente respeita transparência.

**Se o cliente pediu algo específico na reunião anterior:**
→ Incluir como Slide 5.5 (antes de Próximos Passos) respondendo diretamente ao pedido.

**Se não tiver dados comparativos (primeiro mês do cliente):**
→ Substituir comparativos por benchmarks do setor quando disponível, ou dizer "primeiro mês — construindo baseline".

---

## Checklist pré-reunião

- [ ] Números conferidos contra o relatório (não pode ter divergência)
- [ ] Linguagem revisada — zero siglas sem tradução
- [ ] Próximos passos alinhados com @flux (plano de mídia do próximo mês)
- [ ] Apresentação enviada ao cliente 24h antes da reunião
- [ ] Tempo estimado: 20-30 minutos (cronometrar ensaio)
- [ ] Pauta da reunião definida (além da apresentação: dúvidas, feedback, alinhamentos)
- [ ] Pedidos da reunião anterior verificados e respondidos

---

## Exemplo Real

> Slides 2 e 3 de uma apresentação OCP_ (Ocupacional).
> Use como referência de formato, densidade de informação e tom.

---

**Slide 2 — Resumo Executivo**

📊 Resultados de Fevereiro

💰 R$ 5.420 investidos
👤 87 leads gerados (↑ 22% vs janeiro)
💵 R$ 62,30 por lead (↓ 9,5% — mais eficiente)

⭐ O Meta Ads trouxe 58% dos leads com custo 31% menor que o Google
⚠️ Google Pesquisa com custo subindo — vamos ajustar as palavras-chave em março

---

**Slide 3 — Performance por Canal**

| Canal | Investido | Leads | CPL | vs. Jan |
|-------|-----------|-------|-----|---------|
| Meta Ads | R$ 3.180 | 51 | R$ 62,35 | ↑ 28% leads |
| Google Ads | R$ 2.240 | 36 | R$ 62,22 | ↓ 8% leads |
| **Total** | **R$ 5.420** | **87** | **R$ 62,30** | **↑ 22% leads** |

**Destaque:** Meta Feed com imagens diretas é o canal mais eficiente. Google precisa de ajuste nas palavras-chave para março.
