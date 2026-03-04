# Task: Identificação & Briefing de Novo Cliente

**Agente:** @flux
**Comando:** `*onboarding-identificacao {cliente}`
**Frequência:** Sob demanda (onboarding de novo cliente)
**Workflow:** `*new-client` — Step 1

---

## Objetivo

Mapear todas as informações essenciais do novo cliente para fundamentar a estratégia de mídia — objetivos de negócio, público-alvo, oferta, concorrência e budget.

---

## Inputs

- `{cliente}` — nome do cliente
- Acesso ao site/redes sociais do cliente
- Contato com o cliente ou responsável comercial

---

## Execução

### Passo 1 — Dados básicos do cliente

Coletar e documentar:
- Nome completo / Razão social
- CNPJ
- Prefixo para a squad (ex: OCP_, ASM_)
- Site / Instagram / LinkedIn
- Contato principal (nome, cargo, email, telefone)

### Passo 2 — Objetivos de negócio

Entender com o cliente:
- Qual o objetivo principal? (leads, vendas, awareness, tráfego)
- Qual a meta de volume? (quantos leads/vendas por mês)
- Qual o custo máximo aceitável por lead/venda?
- Tem sazonalidade conhecida?
- Já fez mídia paga antes? Se sim, o que funcionou/não funcionou?

### Passo 3 — Público-alvo

Mapear:
- Quem é o cliente ideal? (persona)
- Região de atuação (cidades, estados, nacional)
- Faixa etária, gênero, renda (se relevante)
- Cargo/função (se B2B)
- Setor de atuação (se B2B)
- Dores e desejos principais

### Passo 4 — Oferta e produto

Documentar:
- Produto/serviço principal
- Diferencial competitivo (por que escolher este cliente?)
- Proposta de valor em 1 frase
- Preço / faixa de preço (se relevante para ads)
- Landing page ou destino dos anúncios

### Passo 5 — Concorrência

Pesquisar:
- 3-5 concorrentes diretos
- O que estão fazendo em mídia paga (Meta Ad Library, Google Ads Transparency)
- Posicionamento de preço vs. concorrência
- Oportunidades não exploradas

### Passo 6 — Budget e canais

Confirmar:
- Budget mensal aprovado em R$
- Canais desejados (Meta, Google, LinkedIn)
- Distribuição inicial sugerida por canal
- Prazo de início das campanhas

---

## Output

```
📋 Briefing de Onboarding — {cliente}

DADOS BÁSICOS:
- Nome: {nome}
- CNPJ: {cnpj}
- Prefixo: {PREFIX_}
- Site: {url}
- Contato: {nome} ({cargo}) — {email}

OBJETIVOS:
- Objetivo principal: {leads/vendas/awareness}
- Meta mensal: {n} {leads/vendas}
- CPL/CPA meta: R$ {valor}
- Já fez mídia: {sim/não — resumo}

PÚBLICO:
- {descrição do público}
- Região: {região}
- Persona: {descrição}

OFERTA:
- Produto: {produto/serviço}
- Diferencial: {diferencial}
- Proposta de valor: "{frase}"

CONCORRÊNCIA:
- {concorrente 1}: {o que faz em mídia}
- {concorrente 2}: {o que faz em mídia}

BUDGET:
- Total: R$ {valor}/mês
- Canais: {Meta, Google, LinkedIn}
- Início: {data}
```

---

## Outputs

- [ ] Briefing documentado no Notion (página do cliente)
- [ ] Prefixo do cliente definido e comunicado à squad
- [ ] Objetivos e metas documentados
- [ ] Concorrência mapeada
- [ ] Budget e canais confirmados
- [ ] Pronto para @finn/*onboarding-operacional

---

## Tom e padrões de escrita

**Tom geral:** investigativo, completo, sem lacunas. O briefing de onboarding é o alicerce — tudo que vier depois depende dele.

**Sempre:**
- Fazer TODAS as perguntas antes de avançar — informação faltante agora vira retrabalho depois
- Documentar respostas literais do cliente entre aspas quando relevante
- Registrar o que o cliente NÃO quer (restrições, tom de voz a evitar, público a excluir)

**Nunca:**
- Avançar para estratégia sem ter budget confirmado
- Assumir público-alvo sem validar com o cliente
- Pular a análise de concorrência — é input obrigatório para *estrategia

---

## Comportamento do agente

**Se o cliente não souber responder sobre público-alvo:**
→ Usar dados do site/redes sociais + setor para propor uma persona inicial. Marcar como "hipótese — validar em 30 dias".

**Se o budget for muito baixo para os canais desejados (< R$ 1.000/canal):**
→ Recomendar concentração em 1 canal e justificar qual.

**Se o cliente nunca fez mídia paga:**
→ Incluir expectativas realistas no briefing: "Primeiro mês é baseline — resultados consistentes a partir do mês 2-3."
