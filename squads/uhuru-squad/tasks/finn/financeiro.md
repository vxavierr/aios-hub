# Task: Processo Financeiro Mensal

**Agente:** @finn
**Comando:** `*financeiro {mês}`
**Frequência:** Mensal

---

## Objetivo

Executar o processo financeiro do mês — confirmar investimentos no Operant, verificar notas fiscais e enviar email de fechamento para o time financeiro.

---

## Inputs

- `{mês}` — mês/ano de referência (ex: "jan/2026")
- Relatórios de gasto confirmados das plataformas
- Acesso ao Operant

---

## Execução

### Passo 1 — Consolidar investimentos do mês

Para cada cliente:
1. Abrir planilha de controle de budget
2. Confirmar gasto real vs. gasto planejado por canal
3. Calcular total investido no mês

Tabela de fechamento:
```
{cliente} | Meta: R$ {real} / R$ {planejado} | Google: R$ {real} / R$ {planejado} | Total: R$ {real}
```

### Passo 2 — Registrar no Operant

1. Acessar Operant
2. Lançar os investimentos de cada cliente por plataforma
3. Confirmar que os valores batem com os comprovantes das plataformas

### Passo 3 — Verificar Notas Fiscais

Verificar se as NFs das plataformas foram recebidas:
- Meta Ads: verificar faturamento no Business Manager
- Google Ads: verificar faturas no Google Ads Billing
- LinkedIn: verificar faturas no LinkedIn Campaign Manager

Se NF não recebida → registrar como pendente.

### Passo 4 — Email para Financeiro

Redigir email de fechamento do mês:

```
Assunto: Fechamento de Investimentos em Mídia — {mês}

Equipe Financeiro,

Segue o fechamento dos investimentos em mídia paga do mês de {mês}:

{tabela de gastos por cliente e canal}

Total investido: R$ {total_geral}

NFs recebidas: {lista}
NFs pendentes: {lista}

[Anexar comprovantes de gasto das plataformas]

Qualquer dúvida, estou à disposição.
Att,
```

### Passo 5 — Arquivar

- Salvar comprovantes de gasto em pasta do Google Drive
- Registrar fechamento no Notion como concluído

---

## Outputs

- [ ] Tabela de fechamento por cliente/canal
- [ ] Lançamentos no Operant confirmados
- [ ] NFs verificadas e pendências documentadas
- [ ] Email enviado ao financeiro
- [ ] Arquivamento no Google Drive
