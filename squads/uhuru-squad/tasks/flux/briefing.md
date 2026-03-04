# Task: Briefing de Campanha

**Agente:** @flux
**Comando:** `*briefing {cliente} {campanha}`
**Frequência:** Sob demanda (ao criar nova campanha)

---

## Objetivo

Criar um briefing estruturado para o time criativo produzir os materiais de uma campanha — garantindo alinhamento entre estratégia e criação.

---

## Inputs

- `{cliente}` — código do cliente
- `{campanha}` — nome ou objetivo da campanha
- Plano de mídia do mês (@flux/*planejar)
- Referências de criativos que performaram bem (@nova/*diagnostico)

---

## Execução

### Campos do briefing

**Informações básicas:**
- Cliente: {nome do cliente}
- Campanha: {objetivo da campanha}
- Canal(is): {Meta / Google / LinkedIn}
- Período de veiculação: {data início} → {data fim}
- Budget de produção: R$ {valor} (se aplicável)

**Objetivo da campanha:**
- O que queremos que o usuário FAÇA ao ver este anúncio?
- Qual é a oferta ou proposta de valor?
- Qual é o CTA (Call to Action)?

**Público-alvo:**
- Quem é o público?
- Interesses, comportamentos ou dados demográficos relevantes
- Dores e desejos que o criativo deve tocar

**Especificações técnicas:**
- Formatos necessários: feed, stories, banner, vídeo, etc.
- Dimensões: {especificações por formato}
- Limite de texto: (Meta: 20% regra / Google: limites de caracteres)
- Arquivos entregues em: {data de entrega}

**Referências:**
- Criativos que funcionaram no passado para este cliente
- Referências de concorrentes ou do mercado
- O que NÃO fazer (tom de voz, cores, etc.)

**Métricas de sucesso:**
- CTR esperado: >{%}
- CPL meta: <R$ {valor}

---

## Template de Output

```markdown
# Briefing — {cliente} | {campanha}

**Canal:** {canal}
**Período:** {data_inicio} → {data_fim}

## Objetivo
{o que queremos que o usuário faça}

## Público
{descrição do público-alvo}

## Proposta de Valor
{o que estamos oferecendo / qual dor estamos resolvendo}

## CTA
{chamada para ação principal}

## Formatos necessários
- {formato 1}: {dimensão}
- {formato 2}: {dimensão}

## Referências
{links ou descrição de referências}

## Entrega até: {data}
```

---

## Outputs

- [ ] Briefing documentado no Notion
- [ ] Enviado ao time criativo
- [ ] Data de entrega dos criativos definida

---

## Tom e padrões de escrita

**Tom geral:** claro, visual, orientado à ação criativa. O time criativo não é de mídia — o briefing precisa traduzir estratégia em direção criativa concreta.

**Sempre:**
- Incluir referências visuais (prints, links ou descrição clara do estilo desejado)
- Especificar o que o criativo NÃO deve ter — tão importante quanto o que deve ter
- Vincular o briefing a dados reais: "criativos estáticos com CTA direto geraram CPL 41% menor em fev/2026"
- Incluir prazo de entrega com data específica (nunca "em breve" ou "o mais rápido possível")
- Usar linguagem do público-alvo na seção de CTA — como o cliente final fala, não como o time de mídia fala
- Listar TODOS os formatos e dimensões necessários — o time criativo não deve precisar perguntar

**Nunca:**
- Briefar sem dados de performance — sempre referenciar o que funcionou/não funcionou antes
- Usar jargão de mídia sem traduzir: "CTR alto" não diz nada para o criativo — dizer "as pessoas estão clicando mais quando a imagem mostra X"
- Deixar o CTA vago: "Saiba mais" não é CTA — "Fale com um especialista no WhatsApp" é
- Pedir mais de 5 peças num único briefing sem priorizar — indicar qual é a mais urgente

---

## Comportamento do agente

**Se não tiver diagnóstico de criativos (@nova/*diagnostico) disponível:**
→ Informar que as referências serão baseadas em histórico geral, não em dados específicos do período. Prosseguir, mas flagar a limitação.

**Se o cliente nunca teve criativos antes (primeira campanha):**
→ Basear referências em concorrentes e benchmarks do setor. Marcar como "teste inicial — validar após 14 dias de veiculação".

**Se o briefing pedir vídeo:**
→ Incluir roteiro simplificado (3-5 cenas), duração máxima recomendada e onde o CTA aparece. Vídeos sem roteiro geram retrabalho.

**Se o criativo anterior do mesmo formato estava em fadiga:**
→ Incluir explicitamente: "O criativo anterior estava em fadiga (frequência X, CTR caiu Y%). O novo deve ter abordagem visual diferente — não apenas trocar texto."

---

## Exemplo Real

> Briefing para criativos estáticos do OCP_ (Ocupacional) — Março/2026.

---

# Briefing — OCP_ | Estáticos Março/2026

**Canal:** Meta Ads (Feed + Stories)
**Período:** 10/03 → 31/03/2026

## Objetivo
Gerar leads de empresas que precisam de saúde ocupacional (PCMSO, PGR, eSocial). O usuário deve clicar e preencher o formulário de contato.

## Público
Empresários, gerentes de RH e responsáveis de SST em empresas de 10-300 funcionários em MG. Setores: indústria, construção, transporte, alimentação.

## Proposta de Valor
"Regularize sua empresa com quem entende de saúde ocupacional — atendimento rápido, preço justo, experiência de 15 anos."

## CTA
"Fale com um especialista" → botão WhatsApp

## Formatos necessários
- Feed quadrado: 1080x1080px (prioridade 1)
- Stories: 1080x1920px (prioridade 2)
- Quantidade: 3 estáticos (variações de abordagem)

## Referências
- **Campeão de fev/2026:** Estático "Saúde Ocupacional + CTA WhatsApp" — 18 leads, CPL R$ 38,50. Imagem direta, texto curto, CTA claro.
- **Evitar:** Vídeos institucionais longos (CPL 2x maior em fev). Carrosséis (baixo engajamento no público OCP_).
- **Tom visual:** Profissional mas não frio. Cores da marca. Sem stock genérico — preferir fotos reais ou ilustrações que transmitam confiança.

## Entrega até: 07/03/2026
