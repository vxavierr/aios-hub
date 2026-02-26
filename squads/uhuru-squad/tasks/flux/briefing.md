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
