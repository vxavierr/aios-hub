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
